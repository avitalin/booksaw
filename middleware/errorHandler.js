import { AppError } from '../utils/errors.js';

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists`, 409);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message
  }));
  return new ValidationError(errors);
};

const handleJWTError = () => 
  new AuthenticationError('Invalid token. Please log in again.');

const handleJWTExpiredError = () => 
  new AuthenticationError('Your token has expired. Please log in again.');

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // 複製錯誤對象
  let error = { ...err };
  error.message = err.message;

  // 處理特定類型的錯誤
  if (error.code === 11000) error = handleDuplicateKeyError(error);
  if (error.name === 'ValidationError') error = handleValidationError(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // 開發環境錯誤響應
  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode || 500).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack
    });
  }

  // 生產環境錯誤響應
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      errors: error.errors
    });
  }

  // 未知錯誤的通用響應
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

// 未捕獲的異步錯誤處理
export const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 