class Cart {
  constructor() {
    // Add shopping cart capacity limit
    this.MAX_ITEMS = 99;
    this.MAX_QUANTITY_PER_ITEM = 10;
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
    this.total = this.calculateTotal();
    this.lastActivity = localStorage.getItem('cartLastActivity');
    this.updateCartDisplay();
    this.initCartReminders();
    this.shippingRates = {
      domestic: 5.99,
      international: 19.99,
      express: 12.99
    };
    this.taxRate = 0.1; // 10% tax rate
  }

  initCartReminders() {
    // Check if shopping cart has items but not checked out
    if (this.items.length > 0) {
      // Set last activity time
      if (!this.lastActivity) {
        this.lastActivity = new Date().toISOString();
        localStorage.setItem('cartLastActivity', this.lastActivity);
      }

      // Check if reminder needs to be sent
      this.checkCartReminder();
    }
  }

  checkCartReminder() {
    const now = new Date();
    const lastActivity = new Date(this.lastActivity);
    const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);

    // If more than 4 hours have passed since last activity, show reminder
    if (hoursSinceActivity >= 4) {
      this.showCartReminder();
    }
  }

  showCartReminder() {
    const reminder = document.createElement('div');
    reminder.className = 'cart-reminder';
    reminder.innerHTML = `
      <div class="cart-reminder-content">
        <h3>Complete Your Purchase!</h3>
        <p>You have items waiting in your cart.</p>
        <div class="cart-reminder-actions">
          <button onclick="window.location.href='cart.html'" class="btn-primary">
            View Cart
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-secondary">
            Later
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(reminder);

    // Update last activity time
    this.lastActivity = new Date().toISOString();
    localStorage.setItem('cartLastActivity', this.lastActivity);
  }

  // Add item before checking stock
  async addItem(product) {
    try {
      // Check shopping cart capacity
      if (this.items.length >= this.MAX_ITEMS) {
        throw new Error('Cart is full');
      }

      // Check stock
      const stock = await this.checkProductStock(product.id);
      if (!stock.available) {
        throw new Error('Product out of stock');
      }

      // Check single item quantity limit
      const existingItem = this.items.find(item => item.id === product.id);
      if (existingItem && existingItem.quantity >= this.MAX_QUANTITY_PER_ITEM) {
        throw new Error('Maximum quantity reached for this item');
      }

      // Add item
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({...product, quantity: 1});
      }

      await this.saveCart();
      this.updateCartDisplay();
      
      return true;
    } catch (error) {
      showNotification(error.message, 'error');
      return false;
    }
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartDisplay();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeItem(productId);
      } else {
        this.saveCart();
        this.updateCartDisplay();
      }
    }
  }

  // Add CSRF token
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  // Improve cart synchronization
  async saveCart() {
    try {
      // Local storage
      localStorage.setItem('cart', JSON.stringify(this.items));
      
      // Sync to server
      await secureRequest('/api/cart', {
        method: 'POST',
        body: JSON.stringify(this.items)
      });
    } catch (error) {
      console.error('Failed to save cart:', error);
      showNotification('Failed to sync cart', 'error');
    }
  }

  updateCartDisplay() {
    // Update shopping cart icon quantity
    const cartCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update shopping cart icon
    const cartSpan = document.querySelector('.cart span');
    if (cartSpan) {
      cartSpan.textContent = `Cart:(${cartTotalPrice.toFixed(2)} $)`;
    }
  }

  // Calculate shipping
  calculateShipping(address) {
    if (!address) return 0;
    
    const subtotal = this.calculateSubtotal();
    
    // Free shipping threshold
    if (subtotal >= 100) return 0;
    
    // Calculate shipping based on region
    if (address.country === 'US') {
      return this.shippingRates.domestic;
    }
    return this.shippingRates.international;
  }

  // Calculate tax
  calculateTax(address) {
    if (!address) return 0;
    
    const subtotal = this.calculateSubtotal();
    return subtotal * this.taxRate;
  }

  // Calculate subtotal
  calculateSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Calculate total
  calculateTotal(address) {
    const subtotal = this.calculateSubtotal();
    const shipping = this.calculateShipping(address);
    const tax = this.calculateTax(address);
    return subtotal + shipping + tax;
  }
}

// Initialize cart
const cart = new Cart();

// Cart functionality
function handleAddToCart(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const productItem = button.closest('.product-item');
  
  // Get product data
  const product = {
    id: productItem.dataset.productId,
    title: productItem.querySelector('h3').textContent,
    price: productItem.querySelector('.item-price').textContent,
    image: productItem.querySelector('img').src,
    quantity: 1
  };

  // Add to cart
  cart.addItem(product);
  
  // Visual feedback
  button.classList.add('added');
  button.innerHTML = `
    <i class="icon icon-check"></i>
    <span>Added to Cart</span>
  `;
  
  // Show success notification
  showNotification('Item added to cart successfully!', 'success');
  
  // Update cart count
  updateCartCount();
  
  // Reset button after 3 seconds
  setTimeout(() => {
    button.classList.remove('added');
    button.innerHTML = `
      <i class="icon icon-shopping-cart"></i>
      <span>Add to Cart</span>
    `;
  }, 3000);
}

// Update cart count
function updateCartCount() {
  const cartItems = cart.getItems();
  const totalPrice = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const cartCount = document.querySelector('.cart span');
  
  if (cartCount) {
    cartCount.textContent = `Cart:(${totalPrice.toFixed(2)} $)`;
  }
}

// Notification function
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="icon icon-${type === 'success' ? 'check' : 'warning'}" aria-hidden="true"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animation effect
  requestAnimationFrame(() => {
    notification.classList.add('show');
  });
  
  // Auto remove
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  
  // Listen for cart update events
  window.addEventListener('cartUpdate', () => {
    updateCartCount();
  });
});

// Export function
window.handleAddToCart = handleAddToCart;

// Add click event listeners to all "Add to Cart" buttons
document.addEventListener('DOMContentLoaded', () => {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', handleAddToCart);
  });
  
  // Shopping cart icon click event
  const cartIcon = document.querySelector('.cart');
  if (cartIcon) {
    cartIcon.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'cart.html';
    });
  }
});

async function addItem(product) {
  try {
    const stock = await checkProductStock(product.id);
    if (stock < 1) {
      showNotification('Product out of stock', 'error');
      return;
    }
    // Existing addItem logic...
  } catch (error) {
    console.error('Error checking stock:', error);
  }
} 