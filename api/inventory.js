class InventoryAPI {
  static async getStockStatus(productId) {
    const response = await fetch(`/api/inventory/${productId}`);
    return response.json();
  }

  static async updateStock(productId, quantity) {
    const response = await fetch(`/api/inventory/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  }

  static async subscribeToStock(productId, email) {
    const response = await fetch(`/api/inventory/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, email }),
    });
    return response.json();
  }
}

export default InventoryAPI; 