import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import { User } from '../models/User.js';
import { apiLimiter } from './security.js';
import { TokenBlacklist } from '../models/TokenBlacklist.js';

// JWT 配置
const JWT_OPTIONS = {
  expiresIn: '1d',
  algorithm: 'HS256'
};

// JWT 令牌生成
export const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      role: user.role,
      version: user.tokenVersion // 用於強制登出
    },
    config.JWT_SECRET,
    JWT_OPTIONS
  );
};

// 添加刷新令牌生成功能
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      version: user.tokenVersion,
      type: 'refresh'
    },
    config.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
      algorithm: 'HS256'
    }
  );
};

// 認證中間件
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError();
    }

    // 驗證令牌
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256'] // 明確指定算法
    });

    // 檢查用戶
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    // 檢查令牌版本（用於強制登出）
    if (user.tokenVersion !== decoded.version) {
      throw new AuthenticationError('Token has been revoked');
    }

    // 檢查密碼是否已更改
    if (user.passwordChangedAfter(decoded.iat)) {
      throw new AuthenticationError('Password recently changed. Please login again');
    }

    // 檢查用戶狀態
    if (!user.isActive) {
      throw new AuthenticationError('Account is disabled');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

// 登入限制
export const loginLimiter = apiLimiter;

// 權限檢查
export const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || !user.hasPermission(permission)) {
        throw new AuthorizationError('Insufficient permissions');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const hasAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || !permissions.some(p => user.hasPermission(p))) {
        throw new AuthorizationError('Insufficient permissions');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AuthorizationError('Admin access required'));
  }
  next();
};

export const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }
    next();
  };
};

// 令牌黑名單
export const checkTokenBlacklist = async (token) => {
  // 黑名單檢查
};

// IP 白名單
export const checkIPWhitelist = (req, res, next) => {
  // IP 檢查
};

// 多因素認證
export const requireMFA = async (req, res, next) => {
  // MFA 檢查
}; 