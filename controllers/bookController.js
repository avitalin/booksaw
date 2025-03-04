import { asyncErrorHandler } from '../middleware/errorHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import Book from '../models/Book.js';

const bookController = {
  getBooks: asyncErrorHandler(async (req, res) => {
    const { 
      query, 
      category, 
      minPrice, 
      maxPrice,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    
    const books = await Book.search({
      query,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      offset
    });

    res.json(books);
  }),

  getBook: asyncErrorHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) {
      throw new NotFoundError('Book');
    }
    res.json(book);
  }),

  createBook: asyncErrorHandler(async (req, res) => {
    const bookId = await Book.create(req.body);
    res.status(201).json({ id: bookId });
  }),

  updateBook: asyncErrorHandler(async (req, res) => {
    const success = await Book.update(req.params.id, req.body);
    if (!success) {
      throw new NotFoundError('Book');
    }
    res.json({ message: 'Book updated successfully' });
  }),

  deleteBook: asyncErrorHandler(async (req, res) => {
    const success = await Book.delete(req.params.id);
    if (!success) {
      throw new NotFoundError('Book');
    }
    res.json({ message: 'Book deleted successfully' });
  })
};

export default bookController; 