class Analytics {
  constructor() {
    this.events = [];
    this.init();
  }

  init() {
    // 追蹤頁面訪問
    this.trackPageView();
    // 追蹤用戶行為
    this.trackUserBehavior();
    // 追蹤購物車行為
    this.trackCartBehavior();
  }

  trackPageView() {
    const pageData = {
      type: 'pageview',
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
      deviceType: this.getDeviceType(),
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      referrer: document.referrer
    };
    this.saveEvent(pageData);
  }

  trackUserBehavior() {
    // 追蹤產品點擊
    document.querySelectorAll('.product-item').forEach(product => {
      product.addEventListener('click', (e) => {
        this.saveEvent({
          type: 'product_click',
          productId: product.dataset.productId,
          timestamp: new Date().toISOString()
        });
      });
    });

    // 追蹤搜尋行為
    const searchForm = document.querySelector('#search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        this.saveEvent({
          type: 'search',
          query: searchForm.querySelector('input').value,
          timestamp: new Date().toISOString()
        });
      });
    }
  }

  trackCartBehavior() {
    // 追蹤購物車操作
    window.addEventListener('cartUpdate', (e) => {
      this.saveEvent({
        type: 'cart_update',
        items: e.detail.items,
        total: e.detail.total,
        timestamp: new Date().toISOString()
      });
    });
  }

  getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  async saveEvent(eventData) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }
}

export default new Analytics(); 