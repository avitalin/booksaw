import pool from '../database/connection.js';

class Order {
  static async create(orderData) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 創建訂單
      const [orderResult] = await conn.execute(
        `INSERT INTO orders (user_id, total_amount, shipping_address, status)
         VALUES (?, ?, ?, ?)`,
        [orderData.userId, orderData.totalAmount, orderData.shippingAddress, 'pending']
      );

      const orderId = orderResult.insertId;

      // 創建訂單項目
      const itemValues = orderData.items.map(item => 
        [orderId, item.bookId, item.quantity, item.unitPrice]
      );
      
      await conn.query(
        `INSERT INTO order_items (order_id, book_id, quantity, unit_price)
         VALUES ?`,
        [itemValues]
      );

      // 更新書籍庫存
      for (const item of orderData.items) {
        await conn.execute(
          `UPDATE books 
           SET stock_quantity = stock_quantity - ?
           WHERE id = ?`,
          [item.quantity, item.bookId]
        );
      }

      await conn.commit();
      return orderId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findByUser(userId) {
    try {
      const [orders] = await pool.execute(
        `SELECT o.*, 
                GROUP_CONCAT(DISTINCT 
                  JSON_OBJECT(
                    'id', oi.id,
                    'bookId', oi.book_id,
                    'quantity', oi.quantity,
                    'unitPrice', oi.unit_price,
                    'title', b.title
                  )
                ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN books b ON oi.book_id = b.id
         WHERE o.user_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [userId]
      );

      return orders.map(order => ({
        ...order,
        items: JSON.parse(`[${order.items}]`)
      }));
    } catch (error) {
      console.error('Error in findByUser:', error);
      throw error;
    }
  }
}

export default Order; 