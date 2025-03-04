import authService from './services/auth.js';

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await authService.login(email, password);
      // Redirect to home page on successful login
      window.location.href = '/';
    } catch (error) {
      // Show error message to user
      alert('Login failed. Please check your credentials.');
    }
  });
}

// Handle register form submission
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('密碼不一致');
      return;
    }

    try {
      await authService.register({ name, email, password });
      window.location.href = 'login.html?registered=true';
    } catch (error) {
      alert('註冊失敗，請稍後再試');
    }
  });
}

// Update header based on auth state
function updateAuthUI() {
  const accountLink = document.querySelector('.user-account');
  const cartLink = document.querySelector('.cart');
  
  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    accountLink.innerHTML = `
      <i class="icon icon-user"></i>
      <span>${user.name}</span>
    `;
    
    // Add logout button
    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.className = 'for-buy ms-3';
    logoutBtn.innerHTML = '<i class="icon icon-exit"></i><span>Logout</span>';
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authService.logout();
      window.location.reload();
    });
    
    accountLink.parentNode.appendChild(logoutBtn);
  } else {
    accountLink.innerHTML = `
      <i class="icon icon-user"></i>
      <span>Login</span>
    `;
    accountLink.href = '/login.html';
  }
}

// Update API calls to include auth token
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options = {}] = args;
  
  if (authService.isAuthenticated()) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${authService.getToken()}`
    };
  }
  
  return originalFetch(url, options);
};

// Initialize auth UI
document.addEventListener('DOMContentLoaded', updateAuthUI);

class Auth {
  constructor() {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    const protectedPages = ['account.html', 'checkout.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !this.user) {
      window.location.href = 'login.html';
    }

    this.updateUIElements();
  }

  updateUIElements() {
    const accountLink = document.querySelector('.user-account');
    if (accountLink) {
      if (this.user) {
        accountLink.innerHTML = `
          <i class="icon icon-user"></i>
          <span>${this.user.name}</span>
        `;
      } else {
        accountLink.innerHTML = `
          <i class="icon icon-user"></i>
          <span>Login</span>
        `;
      }
    }
  }

  login(credentials) {
    // 實作登入邏輯
  }

  logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  }
}

export default new Auth(); 