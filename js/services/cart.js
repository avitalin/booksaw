class CartService {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
  }

  addItem(product) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    this.saveCart();
    this.updateCartDisplay();
  }

  removeItem(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.dispatchCartEvent();
  }

  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
      this.dispatchCartEvent();
    }
  }

  getTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  clear() {
    this.cart = [];
    this.saveCart();
    this.dispatchCartEvent();
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  private dispatchCartEvent() {
    window.dispatchEvent(new CustomEvent('cartUpdate', {
      detail: {
        items: this.cart,
        total: this.getTotal()
      }
    }));
  }

  updateCartDisplay() {
    const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update cart icon display
    const cartElement = document.querySelector('.cart.for-buy span');
    if (cartElement) {
      cartElement.textContent = `Cart:(${cartTotal.toFixed(2)} $)`;
    }
  }
}

// Initialize cart service
const cartService = new CartService();

export default cartService; 