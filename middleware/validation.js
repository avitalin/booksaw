import { body, param, query, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

// 通用驗證結果處理
const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }
  next();
};

// 書籍驗證
export const validateBook = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
  
  body('isbn')
    .matches(/^\d{13}$/).withMessage('ISBN must be 13 digits')
    .custom(value => {
      // ISBN-13 checksum validation
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(value[i]) * (i % 2 === 0 ? 1 : 3);
      }
      const checksum = (10 - (sum % 10)) % 10;
      return parseInt(value[12]) === checksum;
    }).withMessage('Invalid ISBN-13 checksum'),
  
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .custom(value => value <= 999999.99).withMessage('Price exceeds maximum allowed'),
  
  body('stockQuantity')
    .isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  
  body('publishedDate')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .custom(value => new Date(value) <= new Date()).withMessage('Published date cannot be in the future'),
  
  body('categoryId')
    .optional()
    .isInt().withMessage('Category ID must be an integer'),
  
  body('authorIds')
    .optional()
    .isArray().withMessage('Author IDs must be an array')
    .custom(value => value.every(id => Number.isInteger(id) && id > 0))
    .withMessage('Invalid author ID'),

  handleValidationResult
];

// 評論驗證
export const validateReview = [
  param('bookId')
    .isInt().withMessage('Invalid book ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
    .escape(),

  handleValidationResult
];

// 訂單驗證
export const validateOrder = [
  body('items')
    .isArray().withMessage('Items must be an array')
    .notEmpty().withMessage('Order must contain at least one item'),
  
  body('items.*.bookId')
    .isInt().withMessage('Invalid book ID'),
  
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .custom(value => value <= 99).withMessage('Maximum quantity per item is 99'),
  
  body('shippingAddress')
    .notEmpty().withMessage('Shipping address is required')
    .trim()
    .isLength({ min: 10, max: 500 }).withMessage('Address must be between 10 and 500 characters'),
  
  body('totalAmount')
    .isFloat({ min: 0 }).withMessage('Total amount must be positive')
    .custom(value => value <= 999999.99).withMessage('Total amount exceeds maximum allowed'),

  handleValidationResult
];

// 搜尋參數驗證
export const validateSearch = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum price must be non-negative'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum price must be non-negative')
    .custom((value, { req }) => {
      const minPrice = req.query.minPrice;
      return !minPrice || parseFloat(value) >= parseFloat(minPrice);
    }).withMessage('Maximum price must be greater than minimum price'),
  
  query('sortBy')
    .optional()
    .isIn(['title', 'price', 'published_date', 'average_rating'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort order must be ASC or DESC'),

  handleValidationResult
];

// 用戶驗證
export const validateUser = [
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
    .withMessage('Password must contain at least one letter and one number'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

  handleValidationResult
];

// 密碼更新驗證
export const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
    .withMessage('New password must contain at least one letter and one number')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from current password'),
  
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),

  handleValidationResult
]; 