import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// 日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 開發環境控制台格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}]: ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += '\n' + JSON.stringify(metadata, null, 2);
      }
      return msg;
    }
  )
);

// 創建日誌目錄
const logDir = 'logs';

// 配置日誌傳輸
const transports = [
  // 錯誤日誌
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '30d',
    maxSize: '20m',
    format: logFormat
  }),

  // 應用日誌
  new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    maxSize: '20m',
    format: logFormat
  }),

  // 訪問日誌
  new DailyRotateFile({
    filename: path.join(logDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    maxSize: '20m',
    format: logFormat
  })
];

// 開發環境添加控制台輸出
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

// 創建日誌實例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports
});

// 請求日誌中間件
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // 響應結束時記錄
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || 'anonymous'
    };

    if (res.statusCode >= 400) {
      logger.error('Request failed', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

// 錯誤日誌中間件
export const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: {
      message: err.message,
      stack: err.stack,
      ...err
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
      userId: req.user?.id || 'anonymous',
      ip: req.ip
    }
  });
  next(err);
};

// 審計日誌
export const auditLogger = {
  log: (action, details) => {
    logger.info('Audit log', { action, ...details });
  },
  
  userAction: (userId, action, details) => {
    logger.info('User action', {
      userId,
      action,
      timestamp: new Date(),
      ...details
    });
  },
  
  systemAction: (action, details) => {
    logger.info('System action', {
      action,
      timestamp: new Date(),
      ...details
    });
  },
  
  securityEvent: (event, details) => {
    logger.warn('Security event', {
      event,
      timestamp: new Date(),
      ...details
    });
  }
};

export default logger; 