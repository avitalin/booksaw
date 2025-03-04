import pool from '../database/connection.js';

class Book {
  static async findAll({ limit = 10, offset = 0, category = null }) {
    try {
      let query = `
        SELECT b.*, 
               c.name as category_name,
               GROUP_CONCAT(a.name) as authors
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN book_authors ba ON b.id = ba.book_id
        LEFT JOIN authors a ON ba.author_id = a.id
      `;

      const params = [];
      if (category) {
        query += ' WHERE c.slug = ?';
        params.push(category);
      }

      query += ' GROUP BY b.id LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT b.*, 
               c.name as category_name,
               GROUP_CONCAT(a.name) as authors,
               AVG(r.rating) as average_rating,
               COUNT(r.id) as review_count
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN book_authors ba ON b.id = ba.book_id
        LEFT JOIN authors a ON ba.author_id = a.id
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE b.id = ?
        GROUP BY b.id
      `, [id]);
      
      return rows[0];
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  static async create(bookData) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Insert book
      const [result] = await conn.execute(`
        INSERT INTO books (
          title, isbn, description, price, 
          stock_quantity, cover_image_url, 
          published_date, publisher, category_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        bookData.title,
        bookData.isbn,
        bookData.description,
        bookData.price,
        bookData.stockQuantity,
        bookData.coverImageUrl,
        bookData.publishedDate,
        bookData.publisher,
        bookData.categoryId
      ]);

      const bookId = result.insertId;

      // Insert book authors
      if (bookData.authorIds?.length) {
        const authorValues = bookData.authorIds.map(authorId => [bookId, authorId]);
        await conn.query(
          'INSERT INTO book_authors (book_id, author_id) VALUES ?',
          [authorValues]
        );
      }

      await conn.commit();
      return bookId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async update(id, bookData) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 更新書籍基本資料
      await conn.execute(`
        UPDATE books 
        SET title = ?,
            isbn = ?,
            description = ?,
            price = ?,
            stock_quantity = ?,
            cover_image_url = ?,
            published_date = ?,
            publisher = ?,
            category_id = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        bookData.title,
        bookData.isbn,
        bookData.description,
        bookData.price,
        bookData.stockQuantity,
        bookData.coverImageUrl,
        bookData.publishedDate,
        bookData.publisher,
        bookData.categoryId,
        id
      ]);

      // 更新作者關聯
      if (bookData.authorIds) {
        // 先刪除現有關聯
        await conn.execute('DELETE FROM book_authors WHERE book_id = ?', [id]);
        
        // 添加新的關聯
        if (bookData.authorIds.length) {
          const authorValues = bookData.authorIds.map(authorId => [id, authorId]);
          await conn.query(
            'INSERT INTO book_authors (book_id, author_id) VALUES ?',
            [authorValues]
          );
        }
      }

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async delete(id) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 刪除相關資料
      await conn.execute('DELETE FROM book_authors WHERE book_id = ?', [id]);
      await conn.execute('DELETE FROM reviews WHERE book_id = ?', [id]);
      await conn.execute('DELETE FROM cart_items WHERE book_id = ?', [id]);
      await conn.execute('DELETE FROM wishlists WHERE book_id = ?', [id]);
      
      // 最後刪除書籍本身
      const [result] = await conn.execute('DELETE FROM books WHERE id = ?', [id]);
      
      await conn.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // 進階查詢方法
  static async search({ 
    query = '', 
    category = null, 
    minPrice = null, 
    maxPrice = null,
    sortBy = 'title',
    sortOrder = 'ASC',
    limit = 10, 
    offset = 0 
  }) {
    try {
      let sql = `
        SELECT b.*, 
               c.name as category_name,
               GROUP_CONCAT(a.name) as authors,
               AVG(r.rating) as average_rating,
               COUNT(DISTINCT r.id) as review_count
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN book_authors ba ON b.id = ba.book_id
        LEFT JOIN authors a ON ba.author_id = a.id
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE 1=1
      `;
      
      const params = [];

      // 搜尋條件
      if (query) {
        sql += ` AND (b.title LIKE ? OR b.description LIKE ? OR a.name LIKE ?)`;
        const searchPattern = `%${query}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (category) {
        sql += ` AND c.slug = ?`;
        params.push(category);
      }

      if (minPrice !== null) {
        sql += ` AND b.price >= ?`;
        params.push(minPrice);
      }

      if (maxPrice !== null) {
        sql += ` AND b.price <= ?`;
        params.push(maxPrice);
      }

      // 分組
      sql += ` GROUP BY b.id`;

      // 排序
      const allowedSortFields = ['title', 'price', 'published_date', 'average_rating'];
      const allowedSortOrders = ['ASC', 'DESC'];
      
      const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'title';
      const finalSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase()) 
        ? sortOrder.toUpperCase() 
        : 'ASC';

      sql += ` ORDER BY ${finalSortBy} ${finalSortOrder}`;

      // 分頁
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }
}

export default Book; 