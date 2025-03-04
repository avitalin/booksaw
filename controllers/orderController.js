import Order from '../models/Order.js';
import { authenticateToken } from '../middleware/auth.js';

const orderController = {
  async createOrder(req, res) {
    try {
      const orderData = {
        userId: req.user.id,
        ...req.body
      };
      
      const orderId = await Order.create(orderData);
      res.status(201).json({ id: orderId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getUserOrders(req, res) {
    try {
      const orders = await Order.findByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default orderController; 