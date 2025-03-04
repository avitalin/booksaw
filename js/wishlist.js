import wishlistService from './services/wishlist.js';

function loadWishlist() {
  const wishlistItems = document.getElementById('wishlist-items');
  const emptyWishlist = document.getElementById('empty-wishlist');
  const items = wishlistService.getItems();

  if (items.length === 0) {
    wishlistItems.style.display = 'none';
    emptyWishlist.style.display = 'block';
    return;
  }

  wishlistItems.style.display = 'grid';
  emptyWishlist.style.display = 'none';

  wishlistItems.innerHTML = items.map(item => `
    <div class="wishlist-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.title}">
      <div class="wishlist-item-content">
        <h3 class="wishlist-item-title">${item.title}</h3>
        <div class="wishlist-item-price">$${item.price}</div>
        <div class="wishlist-item-actions">
          <button class="btn btn-primary add-to-cart-from-wishlist">
            Add to Cart
          </button>
          <button class="btn btn-outline-danger remove-from-wishlist">
            Remove
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Update wishlist count
  document.querySelector('.wishlist-count').textContent = 
    `(${items.length} items)`;

  // Add event listeners
  document.querySelectorAll('.add-to-cart-from-wishlist').forEach(button => {
    button.addEventListener('click', (e) => {
      const item = items.find(item => 
        item.id === e.target.closest('.wishlist-item').dataset.id
      );
      cartService.addItem(item);
    });
  });

  document.querySelectorAll('.remove-from-wishlist').forEach(button => {
    button.addEventListener('click', (e) => {
      const itemId = e.target.closest('.wishlist-item').dataset.id;
      wishlistService.removeItem(itemId);
      loadWishlist();
    });
  });
}

// Initialize wishlist
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('wishlist-section')) {
    loadWishlist();
    
    // Listen for wishlist updates
    window.addEventListener('wishlistUpdate', () => {
      loadWishlist();
    });
  }
}); 