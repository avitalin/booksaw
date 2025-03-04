import { auditLogger } from '../utils/logger.js';
import { User } from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.js';
import { hashPassword, comparePassword, generateResetToken, hashToken } from '../utils/crypto.js';
import { AuthenticationError } from '../utils/errors.js';
import { sendResetPasswordEmail } from '../utils/email.js';

const authController = {
  // 註冊
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      
      // 檢查郵箱是否已存在
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new AuthenticationError('Email already registered');
      }

      // 創建用戶
      const hashedPassword = await hashPassword(password);
      const user = await User.create({
        email,
        password: hashedPassword,
        name
      });

      auditLogger.userAction(user.id, 'register', {
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      // 生成令牌
      const accessToken = generateAccessToken(user);
      const refreshToken = await generateRefreshToken(user);

      res.status(201).json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 登入
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      // 驗證用戶
      const user = await User.findByEmail(email);
      if (!user || !(await comparePassword(password, user.password))) {
        auditLogger.securityEvent('failed_login_attempt', {
          email,
          ip: req.ip,
          reason: 'invalid_credentials'
        });
        throw new AuthenticationError('Invalid email or password');
      }

      // 檢查帳戶狀態
      if (!user.isActive) {
        auditLogger.securityEvent('login_blocked', {
          userId: user.id,
          reason: 'account_inactive'
        });
        throw new AuthenticationError('Account is disabled');
      }

      // 生成令牌
      const accessToken = generateAccessToken(user);
      const refreshToken = await generateRefreshToken(user);

      auditLogger.userAction(user.id, 'login', {
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 刷新令牌
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      // 驗證刷新令牌
      const userId = await User.verifyRefreshToken(refreshToken);
      const user = await User.findById(userId);

      if (!user) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // 生成新的訪問令牌
      const accessToken = generateAccessToken(user);

      auditLogger.userAction(user.id, 'token_refresh', {
        ip: req.ip
      });

      res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  },

  // 登出
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user.id;

      // 刪除刷新令牌
      await User.removeRefreshToken(userId, refreshToken);
      
      auditLogger.userAction(userId, 'logout', {
        ip: req.ip
      });

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  // 請求密碼重置
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        // 不透露用戶是否存在
        return res.json({ message: 'If the email exists, a reset link will be sent' });
      }

      // 生成重置令牌
      const { resetToken, hashedToken, expiresAt } = generateResetToken();
      await User.setResetToken(user.id, hashedToken, expiresAt);

      // 發送重置郵件
      await sendResetPasswordEmail(user.email, resetToken);

      auditLogger.userAction(user.id, 'password_reset_requested', {
        ip: req.ip
      });

      res.json({ message: 'If the email exists, a reset link will be sent' });
    } catch (error) {
      next(error);
    }
  },

  // 重置密碼
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const hashedToken = hashToken(token);

      // 驗證令牌
      const user = await User.findByResetToken(hashedToken);
      if (!user) {
        throw new AuthenticationError('Invalid or expired reset token');
      }

      // 更新密碼
      const hashedPassword = await hashPassword(newPassword);
      await User.updatePassword(user.id, hashedPassword);
      await User.clearResetToken(user.id);

      // 強制登出所有設備
      await User.incrementTokenVersion(user.id);

      auditLogger.userAction(user.id, 'password_reset_completed', {
        ip: req.ip
      });

      res.json({ message: 'Password has been reset' });
    } catch (error) {
      next(error);
    }
  },

  // 更改密碼
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user || !(await comparePassword(currentPassword, user.password))) {
        auditLogger.securityEvent('failed_password_change', {
          userId,
          reason: 'invalid_current_password'
        });
        throw new AuthenticationError('Invalid current password');
      }

      // 更新密碼
      const hashedPassword = await hashPassword(newPassword);
      await User.updatePassword(userId, hashedPassword);
      
      // 強制登出其他設備
      await User.incrementTokenVersion(userId);

      auditLogger.userAction(userId, 'password_change', {
        ip: req.ip
      });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }
};

export default authController; 