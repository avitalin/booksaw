import { api } from '../utils/api';

export const fetchCart = async () => {
  const response = await api.get('/cart');
  return response.data;
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