import pool from '../database/connection.js';
import bcrypt from 'bcrypt';

class User {
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  static async create(userData) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [result] = await conn.execute(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        [userData.email, hashedPassword, userData.name]
      );

      await conn.commit();
      return result.insertId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

export default User; 