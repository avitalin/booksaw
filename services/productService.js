import { api } from '../utils/api';

export const productService = {
  async getProducts() {
    return await api.get('/products');
  }
};

export const fetchProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
}; 