import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { NotFoundError, ValidationError } from '../utils/errors';

const cartController = {
  // 獲取購物車
  async getCart(req, res, next) {
    try {
      const cart = await Cart.findOne({ user: req.user.id })
        .populate('items.product', 'name image price');
      
      if (!cart) {
        return res.json({ items: [], totalAmount: 0 });
      }
      
      res.json(cart);
    } catch (error) {
      next(error);
    }
  },

  // 添加商品到購物車
  async addItem(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      
      // 檢查商品
      const product = await Product.findById(productId);
      if (!product) {
        throw new NotFoundError('Product not found');
      }
      
      // 檢查庫存
      if (product.stock < quantity) {
        throw new ValidationError('Insufficient stock');
      }

      // 獲取或創建購物車
      let cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        cart = new Cart({ user: req.user.id, items: [] });
      }

      // 檢查商品是否已在購物車中
      const existingItem = cart.items.find(item => 
        item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = product.price;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          price: product.price
        });
      }

      // 計算總價
      cart.calculateTotal();
      await cart.save();

      res.json(cart);
    } catch (error) {
      next(error);
    }
  },

  // 更新購物車商品數量
  async updateQuantity(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      
      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        throw new NotFoundError('Cart not found');
      }

      const item = cart.items.find(item => 
        item.product.toString() === productId
      );
      
      if (!item) {
        throw new NotFoundError('Product not found in cart');
      }

      // 檢查庫存
      const product = await Product.findById(productId);
      if (product.stock < quantity) {
        throw new ValidationError('Insufficient stock');
      }

      item.quantity = quantity;
      cart.calculateTotal();
      await cart.save();

      res.json(cart);
    } catch (error) {
      next(error);
    }
  },

  // 從購物車移除商品
  async removeItem(req, res, next) {
    try {
      const { productId } = req.params;
      
      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        throw new NotFoundError('Cart not found');
      }

      cart.items = cart.items.filter(item => 
        item.product.toString() !== productId
      );
      
      cart.calculateTotal();
      await cart.save();

      res.json(cart);
    } catch (error) {
      next(error);
    }
  },

  // 清空購物車
  async clearCart(req, res, next) {
    try {
      const cart = await Cart.findOne({ user: req.user.id });
      if (cart) {
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
      }
      
      res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
      next(error);
    }
  }
};

export default cartController; 