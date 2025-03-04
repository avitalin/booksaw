class SecurityCheck {
  constructor() {
    this.checkCSRF();
    this.checkXSS();
    this.checkSQLInjection();
    this.setupSecurityHeaders();
  }

  checkCSRF() {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    
    // Add CSRF token to all AJAX requests
    document.addEventListener('ajaxSend', function(e) {
      e.detail.xhr.setRequestHeader('X-CSRF-Token', token);
    });
  }

  checkXSS() {
    // Sanitize user input
    document.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', (e) => {
        e.target.value = this.sanitizeInput(e.target.value);
      });
    });
  }

  sanitizeInput(input) {
    return input.replace(/[<>]/g, '');
  }

  checkSQLInjection() {
    // Check for common SQL injection patterns
    const sqlPatterns = /('|--|;|drop|select|union)/i;
    
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
          if (sqlPatterns.test(input.value)) {
            e.preventDefault();
            alert('Invalid input detected');
          }
        });
      });
    });
  }

  setupSecurityHeaders() {
    // These would typically be set server-side
    const headers = {
      'Content-Security-Policy': "default-src 'self'",
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff'
    };
  }
}

export default new SecurityCheck();

// 建議添加 CSRF 保護
const addCSRFToken = () => {
  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  if (!token) {
    console.error('CSRF token not found');
    return {};
  }
  return {
    'X-CSRF-Token': token
  };
}

// 建議添加輸入驗證
const validateInput = (input, type = 'text') => {
  // 先消毒
  const sanitized = DOMPurify.sanitize(input);
  
  // 根據不同類型進行驗證
  switch(type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized) ? sanitized : '';
    case 'number':
      return /^\d+$/.test(sanitized) ? sanitized : '';
    default:
      return sanitized;
  }
}

// 建議添加 API 請求保護
const secureRequest = async (url, options) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // 添加認證資訊
      headers: {
        ...options.headers,
        ...addCSRFToken()
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  } catch (error) {
    handleError(error);
    throw error; // 向上傳遞錯誤
  }
} 