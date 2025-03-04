import express from 'express';
import cartController from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';
import { validateCartItem } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [購物車]
 *     summary: 獲取購物車
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取購物車
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.get('/', authenticateToken, cartController.getCart);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     tags: [購物車]
 *     summary: 添加商品到購物車
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItemRequest'
 */
router.post('/items', authenticateToken, validateCartItem, cartController.addItem);

router.put('/items', authenticateToken, validateCartItem, cartController.updateQuantity);
router.delete('/items/:productId', authenticateToken, cartController.removeItem);
router.delete('/', authenticateToken, cartController.clearCart);

export default router; 