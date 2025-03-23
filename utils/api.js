import { mockProducts } from './mockData';

// Constants
const STORAGE_KEYS = {
  CART: 'cart',
  AUTH_TOKEN: 'authToken'
};

const DEFAULT_DELAY = 500;
const API_BASE_URL = process.env.API_BASE_URL || '';

// Simulate API delay for development
const delay = (ms = DEFAULT_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

// Helper functions
const safeJSONParse = (data, fallback = []) => {
  try {
    return JSON.parse(data) || fallback;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
};

const safeStorage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
      return false;
    }
  }
};

class Api {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authToken = safeStorage.get(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Auth methods
  setAuthToken(token) {
    this.authToken = token;
    safeStorage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Request helper with real API integration
  async request(endpoint, options = {}) {
    const { method = 'GET', data = null, useDelay = true } = options;

    // Simulate network delay in development
    if (useDelay) {
      await delay();
    }

    // Handle mock endpoints in development
    if (process.env.NODE_ENV === 'development') {
      if (endpoint === '/products') {
        return mockProducts;
      }

      if (endpoint === '/cart') {
        const cart = safeJSONParse(safeStorage.get(STORAGE_KEYS.CART));
        return cart;
      }
    }

    // Real API request configuration
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
      },
      ...(data && { body: JSON.stringify(data) })
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // CRUD methods
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', data });
  }

  async put(endpoint, data) {
    return this.request(endpoint, { method: 'PUT', data });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Cart specific methods
  async getCart() {
    return this.get('/cart');
  }

  async addToCart(item) {
    return this.post('/cart', item);
  }

  async updateCartItem(item) {
    return this.put(`/cart/${item.id}`, item);
  }

  async removeFromCart(itemId) {
    return this.delete(`/cart/${itemId}`);
  }

  // Product methods
  async getProducts() {
    return this.get('/products');
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }
}

// Create and export singleton instance
export const api = new Api();

// Default export for backward compatibility
export default api; 