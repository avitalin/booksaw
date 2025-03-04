import pool from '../database/connection.js';

class Review {
  static async create(reviewData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO reviews (user_id, book_id, rating, comment)
         VALUES (?, ?, ?, ?)`,
        [reviewData.userId, reviewData.bookId, reviewData.rating, reviewData.comment]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  static async findByBook(bookId) {
    try {
      const [reviews] = await pool.execute(
        `SELECT r.*, u.name as user_name
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.book_id = ?
         ORDER BY r.created_at DESC`,
        [bookId]
      );
      return reviews;
    } catch (error) {
      console.error('Error in findByBook:', error);
      throw error;
    }
  }
}

export default Review; 