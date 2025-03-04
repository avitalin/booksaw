class WishlistService {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('wishlist')) || [];
  }

  addItem(product) {
    if (!product || !product.id) {
      console.error('Invalid product data:', product);
      return false;
    }

    if (!this.items.find(item => item.id === product.id)) {
      this.items.push(product);
      this.saveWishlist();
      this.dispatchWishlistEvent();
      return true;
    }
    return false;
  }

  removeItem(productId) {
    const index = this.items.findIndex(item => item.id === productId);
    if (index > -1) {
      this.items.splice(index, 1);
      this.saveWishlist();
      this.dispatchWishlistEvent();
      return true;
    }
    return false;
  }

  getItems() {
    return this.items;
  }

  isInWishlist(productId) {
    return this.items.some(item => item.id === productId);
  }

  private saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(this.items));
  }

  private dispatchWishlistEvent() {
    window.dispatchEvent(new CustomEvent('wishlistUpdate', {
      detail: {
        items: this.items
      }
    }));
  }
}

export default new WishlistService(); 