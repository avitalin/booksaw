import { useState, useContext, useEffect } from 'react';
import { addToCart } from '../../services/cartService';
import { CartContext } from '../../contexts/CartContext';
import { toast } from 'react-hot-toast';
import InventoryAPI from '../../api/inventory';

const ProductCard = ({ product }) => {
  const [adding, setAdding] = useState(false);
  const { updateCartCount } = useContext(CartContext);
  const [stockStatus, setStockStatus] = useState(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadStockStatus();
  }, [product.id]);

  const loadStockStatus = async () => {
    try {
      const status = await InventoryAPI.getStockStatus(product.id);
      setStockStatus(status);
    } catch (error) {
      console.error('Error loading stock status:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(product.id);
      await updateCartCount();
      toast.success('Added to cart successfully');
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error('Failed to add to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleNotifyMe = async (e) => {
    e.preventDefault();
    try {
      await InventoryAPI.subscribeToStock(product.id, email);
      setShowNotifyModal(false);
      toast.success('You will be notified when the item is back in stock!');
    } catch (error) {
      console.error('Error subscribing to stock:', error);
      toast.error('Failed to subscribe to stock notifications');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
      
      {/* Stock Status */}
      <div className="mb-4">
        {stockStatus?.inStock ? (
          <span className="text-green-600">
            In Stock ({stockStatus.quantity} available)
          </span>
        ) : (
          <span className="text-red-600">Out of Stock</span>
        )}
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!stockStatus?.inStock || adding}
        className={`w-full py-2 rounded-md ${
          stockStatus?.inStock && !adding
            ? 'bg-primary text-white hover:bg-primary-dark'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {adding ? 'Adding...' : stockStatus?.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>

      {/* Notify Me Button */}
      {!stockStatus?.inStock && (
        <button
          onClick={() => setShowNotifyModal(true)}
          className="w-full mt-2 py-2 text-primary border border-primary rounded-md hover:bg-primary hover:text-white"
        >
          Notify When Available
        </button>
      )}

      {/* Notify Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h4 className="text-lg font-semibold mb-4">Get Stock Alert</h4>
            <form onSubmit={handleNotifyMe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-2 border rounded-md mb-4"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Notify Me
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard; 