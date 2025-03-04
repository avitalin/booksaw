class ButtonChecker {
  constructor() {
    this.checkAllButtons();
    this.initializeButtonTracking();
  }

  checkAllButtons() {
    // 檢查所有連結按鈕
    document.querySelectorAll('a').forEach(link => {
      if (link.href && !link.href.startsWith('javascript:')) {
        this.checkLink(link);
      }
    });

    // 檢查所有功能按鈕
    this.checkFunctionalButtons();
    
    // 檢查表單提交按鈕
    this.checkFormButtons();
    
    // 檢查互動按鈕
    this.checkInteractiveButtons();
  }

  checkLink(link) {
    const url = link.href;
    
    // 檢查是否有適當的 aria 標籤
    if (!link.getAttribute('aria-label') && !link.textContent.trim()) {
      console.warn('Missing aria-label on empty link:', link);
    }
    
    // 檢查外部連結是否有安全屬性
    if (url.startsWith('http') && !url.includes(window.location.hostname)) {
      if (!link.getAttribute('rel')) {
        console.warn('External link missing rel="noopener noreferrer":', url);
      }
    }

    // 檢查連結有效性
    fetch(url, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          console.warn(`Broken link found: ${url}`);
          link.classList.add('broken-link');
        }
      })
      .catch(error => {
        console.error(`Error checking link ${url}:`, error);
      });
  }

  checkFunctionalButtons() {
    // 檢查購物車按鈕
    document.querySelectorAll('.add-to-cart').forEach(button => {
      if (!button.hasAttribute('data-product-id')) {
        console.warn('Cart button missing product ID:', button);
      }
      
      // 檢查事件監聽器
      if (!this.hasClickListener(button)) {
        console.warn('Cart button missing click handler:', button);
      }
    });

    // 檢查願望清單按鈕
    document.querySelectorAll('.bookmark-btn, .add-to-wishlist').forEach(button => {
      const productItem = button.closest('.product-item');
      if (!productItem?.dataset.productId) {
        console.warn('Wishlist button missing product ID:', button);
      }
      
      // 檢查事件監聽器
      if (!this.hasClickListener(button)) {
        console.warn('Wishlist button missing click handler:', button);
      }
    });
  }

  checkFormButtons() {
    // 檢查表單提交按鈕
    document.querySelectorAll('form button[type="submit"]').forEach(button => {
      const form = button.closest('form');
      
      // 檢查表單驗證
      if (!form.hasAttribute('novalidate') && !this.hasFormValidation(form)) {
        console.warn('Form missing validation:', form);
      }
      
      // 檢查提交處理器
      if (!this.hasSubmitHandler(form)) {
        console.warn('Form missing submit handler:', form);
      }
    });
  }

  checkInteractiveButtons() {
    // 檢查所有具有互動性的按鈕
    document.querySelectorAll('button, [role="button"]').forEach(button => {
      // 檢查可訪問性
      if (!button.hasAttribute('aria-label') && !button.textContent.trim()) {
        console.warn('Button missing aria-label:', button);
      }
      
      // 檢查鍵盤可訪問性
      if (!button.hasAttribute('tabindex')) {
        console.warn('Button missing tabindex:', button);
      }
    });
  }

  hasClickListener(element) {
    const listeners = getEventListeners(element);
    return listeners && (listeners.click || []).length > 0;
  }

  hasFormValidation(form) {
    return form.querySelectorAll('[required], [pattern], [minlength], [maxlength]').length > 0;
  }

  hasSubmitHandler(form) {
    const listeners = getEventListeners(form);
    return listeners && (listeners.submit || []).length > 0;
  }

  initializeButtonTracking() {
    // 追蹤按鈕點擊
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button, [role="button"], a');
      if (button) {
        this.logButtonClick(button);
      }
    });
  }

  logButtonClick(button) {
    const buttonInfo = {
      type: button.tagName.toLowerCase(),
      id: button.id,
      class: button.className,
      text: button.textContent.trim(),
      timestamp: new Date().toISOString()
    };
    
    console.log('Button clicked:', buttonInfo);
  }
}

export default new ButtonChecker(); 