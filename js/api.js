import authService from './services/auth.js';

const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
    inventory: `${API_BASE_URL}/inventory`,
    orders: `${API_BASE_URL}/orders`,
    auth: `${API_BASE_URL}/auth`,
    analytics: `${API_BASE_URL}/analytics`
};

export const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }
    return response.json();
};

const api = {
    async getBooks() {
        try {
            const response = await fetch(`${API_BASE_URL}/books`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching books:', error);
            throw error;
        }
    },

    async getBook(bookId) {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching book ${bookId}:`, error);
            throw error;
        }
    },

    async getProtectedResource() {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${API_BASE_URL}/protected-resource`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching protected resource:', error);
            throw error;
        }
    },

    async addBook(bookData) {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${API_BASE_URL}/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify(bookData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error adding book:', error);
            throw error;
        }
    }
};

export default api; 