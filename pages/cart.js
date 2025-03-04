import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import CartList from '../components/cart/CartList';
import CartSummary from '../components/cart/CartSummary';
import { fetchCart } from '../services/cartService';

const CartPage = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">購物車</h1>
      
      {cart?.items?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartList 
              items={cart.items} 
              onUpdate={loadCart}
            />
          </div>
          <div>
            <CartSummary 
              totalAmount={cart.totalAmount}
              itemCount={cart.items.length}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <a 
            href="/products" 
            className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
          >
            Continue Shopping
          </a>
        </div>
      )}
    </div>
  );
};

export default CartPage; 