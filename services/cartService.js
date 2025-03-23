import { api } from '../utils/api';

export const fetchCart = async () => {
  try {
    const response = await fetch('/api/cart', {
      headers: {
        'Content-Type': 'application/json',
        // 如果需要認證
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { items: [] }; // 返回空購物車作為默認值
  }
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/cart/items', {
    productId,
    quantity
  });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await api.put('/cart/items', {
    productId,
    quantity
  });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/items/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
}; 