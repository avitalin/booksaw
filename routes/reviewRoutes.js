import express from 'express';
import reviewController from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateReview } from '../middleware/validation.js';

const router = express.Router();

router.post('/books/:bookId/reviews', 
  authenticateToken, 
  validateReview,
  reviewController.createReview
);

router.get('/books/:bookId/reviews', 
  reviewController.getBookReviews
);

export default router; 