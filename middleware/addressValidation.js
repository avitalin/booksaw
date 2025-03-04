import { body, param } from 'express-validator';
import { handleValidationResult } from './validation.js';

export const validateAddress = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
  body('street')
    .trim()
    .notEmpty().withMessage('Street address is required')
    .isLength({ min: 5, max: 200 }).withMessage('Street address must be between 5 and 200 characters'),
    
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),
    
  body('state')
    .trim()
    .notEmpty().withMessage('State is required')
    .isLength({ min: 2, max: 100 }).withMessage('State must be between 2 and 100 characters'),
    
  body('zip')
    .trim()
    .notEmpty().withMessage('ZIP code is required')
    .matches(/^\d{5}(-\d{4})?$/).withMessage('Invalid ZIP code format'),
    
  body('country')
    .trim()
    .notEmpty().withMessage('Country is required')
    .isLength({ min: 2, max: 100 }).withMessage('Country must be between 2 and 100 characters'),

  handleValidationResult
]; 