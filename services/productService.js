import { api } from '../utils/api';

export const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
}; 