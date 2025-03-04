import express from 'express';
import orderController from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateOrder } from '../middleware/validation.js';

const router = express.Router();

router.post('/', 
  authenticateToken, 
  validateOrder,
  orderController.createOrder
);

router.get('/user', 
  authenticateToken, 
  orderController.getUserOrders
);

export default router; 