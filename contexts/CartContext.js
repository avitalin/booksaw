import { createContext, useState, useEffect } from 'react';
import { fetchCart } from '../services/cartService';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = async () => {
    try {
      const cart = await fetchCart();
      setCartCount(cart.items.length);
    } catch (error) {
      console.error('Failed to update cart count:', error);
    }
  };

  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
}; 