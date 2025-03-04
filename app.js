import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from './docs/swagger.js';
import { securityMiddleware } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/errors.js';
import { requestLogger, errorLogger } from './utils/logger.js';
import addressRoutes from './routes/addressRoutes.js';

const app = express();

// API 文檔
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customSiteTitle: '書籍管理系統 API 文檔'
  }));
}

// 請求日誌
app.use(requestLogger);

// 安全中間件
app.use(securityMiddleware);

// 解析 JSON
app.use(express.json({ limit: '10kb' })); // 限制請求大小

// 路由
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/books', require('./routes/bookRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/reviews', require('./routes/reviewRoutes'));
app.use('/api/addresses', addressRoutes);

// 處理未找到的路由
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// 錯誤日誌
app.use(errorLogger);

// 錯誤處理
app.use(errorHandler);

export default app; 