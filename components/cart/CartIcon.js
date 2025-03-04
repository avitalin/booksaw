import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { fetchCart } from '../../services/cartService';

const CartIcon = () => {
  const router = useRouter();
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const cart = await fetchCart();
      setItemCount(cart.items.length);
    } catch (error) {
      console.error('Failed to load cart count:', error);
    }
  };

  return (
    <button
      onClick={() => router.push('/cart')}
      className="relative p-2 text-gray-600 hover:text-gray-900"
      aria-label="購物車"
    >
      <ShoppingCartIcon className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon; 