import api from '../api.js';

const bookService = {
  async getBooks(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${api.BASE_URL}/books?${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch books');
      return await response.json();
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  async getBook(id) {
    try {
      const response = await fetch(`${api.BASE_URL}/books/${id}`);
      if (!response.ok) throw new Error('Failed to fetch book');
      return await response.json();
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  },

  async createBook(bookData) {
    try {
      const response = await fetch(`${api.BASE_URL}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookData)
      });
      if (!response.ok) throw new Error('Failed to create book');
      return await response.json();
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  }
};

export default bookService; 