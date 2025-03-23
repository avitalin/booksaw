import { mockProducts } from './mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Api {
  async get(endpoint) {
    await delay(500); // Simulate network delay
    
    switch (endpoint) {
      case '/products':
        return mockProducts;
      case '/cart':
        return JSON.parse(localStorage.getItem('cart') || '[]');
      default:
        throw new Error(`Endpoint ${endpoint} not found`);
    }
  }

  async post(endpoint, data) {
    await delay(500);
    
    switch (endpoint) {
      case '/cart':
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push(data);
        localStorage.setItem('cart', JSON.stringify(cart));
        return cart;
      default:
        throw new Error(`Endpoint ${endpoint} not found`);
    }
  }

  async put(endpoint, data) {
    await delay(500);
    
    if (endpoint.startsWith('/cart/')) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const index = cart.findIndex(item => item.id === data.id);
      if (index !== -1) {
        cart[index] = data;
        localStorage.setItem('cart', JSON.stringify(cart));
      }
      return cart;
    }
    throw new Error(`Endpoint ${endpoint} not found`);
  }

  async delete(endpoint) {
    await delay(500);
    
    if (endpoint.startsWith('/cart/')) {
      const itemId = endpoint.split('/').pop();
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const newCart = cart.filter(item => item.id !== parseInt(itemId));
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    }
    throw new Error(`Endpoint ${endpoint} not found`);
  }
}

export const api = new Api();

export default api; 