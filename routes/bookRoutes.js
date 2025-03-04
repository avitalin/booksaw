import express from 'express';
import bookController from '../controllers/bookController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { validateBook, validateSearch } from '../middleware/validation.js';

const router = express.Router();

router.get('/', validateSearch, bookController.getBooks);
router.get('/:id', bookController.getBook);
router.post('/', authenticateToken, isAdmin, validateBook, bookController.createBook);
router.put('/:id', authenticateToken, isAdmin, validateBook, bookController.updateBook);
router.delete('/:id', authenticateToken, isAdmin, bookController.deleteBook);

export default router; 