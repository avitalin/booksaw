import { useState } from 'react';
import { updateCartItem, removeFromCart } from '../../services/cartService';
import { toast } from 'react-hot-toast';

const CartList = ({ items, onUpdate }) => {
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (productId, quantity) => {
    try {
      setUpdating(true);
      await updateCartItem(productId, quantity);
      await onUpdate();
      toast.success('購物車已更新');
    } catch (error) {
      toast.error('更新失敗');
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setUpdating(true);
      await removeFromCart(productId);
      await onUpdate();
      toast.success('商品已移除');
    } catch (error) {
      toast.error('移除失敗');
      console.error('Failed to remove item:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {items.map((item) => (
        <div 
          key={item.product.id}
          className="flex items-center p-4 border-b last:border-b-0"
        >
          <img 
            src={item.product.image} 
            alt={item.product.name}
            className="w-20 h-20 object-cover rounded"
          />
          
          <div className="flex-grow ml-4">
            <h3 className="font-medium">{item.product.name}</h3>
            <p className="text-gray-600">${item.price}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center border rounded">
              <button
                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                disabled={updating || item.quantity <= 1}
                className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
              >
                -
              </button>
              <span className="px-3 py-1">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                disabled={updating}
                className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleRemove(item.product.id)}
              disabled={updating}
              className="text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartList; 