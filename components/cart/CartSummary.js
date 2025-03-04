const CartSummary = ({ totalAmount, itemCount }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span>Items</span>
          <span>{itemCount} items</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <button 
        onClick={() => window.location.href = '/checkout'}
        className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary-dark"
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartSummary; 