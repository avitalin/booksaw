import cartService from './services/cart.js';
import wishlistService from './services/wishlist.js';

class ProductManager {
  constructor() {
    this.checkProductElements();
    this.initializeProducts();
  }

  checkProductElements() {
    // 檢查產品元素的完整性
    document.querySelectorAll('.product-item').forEach(product => {
      const id = product.dataset.productId;
      const title = product.querySelector('h3');
      const price = product.querySelector('.item-price');
      const image = product.querySelector('img');
      
      if (!id || !title || !price || !image) {
        console.warn('Incomplete product element:', product);
      }
    });
  }

  initializeProducts() {
    // Add to Cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', (e) => {
        const productEl = e.target.closest('.product-style');
        const product = this.getProductData(productEl);
        
        cartService.addItem(product);
        this.showNotification('Item added to cart successfully!');
      });
    });

    // Bookmark functionality
    document.querySelectorAll('.bookmark-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const productEl = e.target.closest('.product-style');
        const product = this.getProductData(productEl);
        
        if (wishlistService.isInWishlist(product.id)) {
          wishlistService.removeItem(product.id);
          button.classList.remove('active');
          button.querySelector('.icon').classList.remove('icon-bookmark');
          button.querySelector('.icon').classList.add('icon-bookmark-o');
          this.showNotification('Item removed from wishlist!');
        } else {
          wishlistService.addItem(product);
          button.classList.add('active');
          button.querySelector('.icon').classList.remove('icon-bookmark-o');
          button.querySelector('.icon').classList.add('icon-bookmark');
          this.showNotification('Item added to wishlist!');
        }
      });
    });

    // Initialize wishlist button states
    this.updateWishlistButtonStates();
  }

  getProductData(productEl) {
    try {
      return {
        id: productEl.dataset.productId,
        title: productEl.querySelector('h3').textContent,
        price: parseFloat(productEl.querySelector('.item-price').textContent.match(/\d+\.\d+/)[0]),
        image: productEl.querySelector('img').src
      };
    } catch (error) {
      console.error('Error getting product data:', error);
      return null;
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="icon icon-check"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  updateWishlistButtonStates() {
    document.querySelectorAll('.bookmark-btn').forEach(button => {
      const productEl = button.closest('.product-style');
      const productId = productEl.dataset.productId;
      
      if (wishlistService.isInWishlist(productId)) {
        button.classList.add('active');
        button.querySelector('.icon').classList.remove('icon-bookmark-o');
        button.querySelector('.icon').classList.add('icon-bookmark');
      }
    });
  }
}

// Initialize product manager
document.addEventListener('DOMContentLoaded', () => {
  new ProductManager();
});

// Wishlist handling
function handleWishlist(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const productItem = button.closest('.product-item');
  const productId = productItem.dataset.productId;
  
  // Get product data
  const product = {
    id: productId,
    title: productItem.querySelector('h3').textContent,
    price: productItem.querySelector('.price').textContent,
    image: productItem.querySelector('img').src
  };

  // Add to wishlist
  const added = wishlistService.addItem(product);
  
  if (added) {
    // Visual feedback
    button.classList.add('active');
    
    // Show notification
    showNotification('Added to Wishlist!', 'success');
    
    // Add animation
    button.classList.add('animate-success');
    setTimeout(() => {
      button.classList.remove('animate-success');
    }, 1000);
  } else {
    showNotification('Already in Wishlist', 'info');
  }
}

// Notification function
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="icon icon-${type === 'success' ? 'check' : 'info'}" aria-hidden="true"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  requestAnimationFrame(() => {
    notification.classList.add('show');
  });
  
  // Remove after delay
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Initialize wishlist buttons
function initWishlistButtons() {
  const wishlistItems = wishlistService.getItems();
  
  document.querySelectorAll('.bookmark-btn').forEach(button => {
    const productId = button.closest('.product-item').dataset.productId;
    if (wishlistItems.find(item => item.id === productId)) {
      button.classList.add('active');
    }
  });
}

// Export functions
window.handleWishlist = handleWishlist;

// Initialize on load
document.addEventListener('DOMContentLoaded', initWishlistButtons); 