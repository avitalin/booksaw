import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { sanitize } from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// Rate limiting 配置
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 每個 IP 限制 100 個請求
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// API 特定的限制
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 更嚴格的限制
  message: 'Too many attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// CORS 配置
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 小時
};

// 安全性中間件配置
export const securityMiddleware = [
  // 基本安全標頭
  helmet(),
  
  // CORS 設置
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }),
  
  // API 請求限制
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 100, // 限制每個IP 100個請求
    message: 'Too many requests, please try again later.'
  }),
  
  // 防止 XSS 攻擊
  helmet.xssFilter(),
  
  // 防止點擊劫持
  helmet.frameguard({ action: 'deny' }),
  
  // 內容安全策略
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }),
  
  // 防止 NoSQL 注入
  sanitize(),
  
  // 防止參數污染
  hpp({
    whitelist: [
      'price',
      'rating',
      'category',
      'author',
      'sort'
    ]
  })
]; 