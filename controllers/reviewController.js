import Review from '../models/Review.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateReview } from '../middleware/validation.js';

const reviewController = {
  async createReview(req, res) {
    try {
      const reviewData = {
        userId: req.user.id,
        bookId: req.params.bookId,
        rating: req.body.rating,
        comment: req.body.comment
      };
      
      const reviewId = await Review.create(reviewData);
      res.status(201).json({ id: reviewId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getBookReviews(req, res) {
    try {
      const reviews = await Review.findByBook(req.params.bookId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default reviewController; 