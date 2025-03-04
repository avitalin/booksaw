// 訂閱功能
function handleSubscribe(event) {
  event.preventDefault();
  
  const form = event.target.closest('form');
  const emailInput = form.querySelector('input[type="email"]');
  const senderEmail = emailInput.value;
  
  if (!senderEmail) {
    showNotification('Please enter your email address', 'warning');
    emailInput.focus();
    return;
  }

  // 顯示訂閱確認
  showSubscriptionConfirmation(senderEmail);
  
  // 清空輸入框
  form.reset();

  // 顯示成功消息
  showNotification('Thank you for subscribing!', 'success');
}

// 顯示訂閱確認
function showSubscriptionConfirmation(email) {
  const confirmationEl = document.createElement('div');
  confirmationEl.className = 'subscription-confirmation';
  confirmationEl.innerHTML = `
    <div class="confirmation-content">
      <h6>Subscription Confirmed!</h6>
      <p>We'll send newsletters to: <strong>${email}</strong></p>
    </div>
  `;
  
  // 找到訂閱表單並在其後插入確認信息
  const subscriptionBox = document.querySelector('.subscription-box');
  const existingConfirmation = subscriptionBox.querySelector('.subscription-confirmation');
  
  if (existingConfirmation) {
    existingConfirmation.remove();
  }
  
  subscriptionBox.appendChild(confirmationEl);
  
  // 3秒後淡出
  setTimeout(() => {
    confirmationEl.classList.add('fade-out');
    setTimeout(() => confirmationEl.remove(), 300);
  }, 3000);
}

// 聯繫我們功能
function handleContact(event) {
  event.preventDefault();
  
  const form = event.target.closest('form');
  const senderEmail = form.querySelector('input[type="email"]').value;
  
  // 創建郵件連結
  const subject = encodeURIComponent('Contact BookSaw Team');
  const body = encodeURIComponent(
    `Dear BookSaw Team,\n\n` +
    `I would like to get in touch with you.\n\n` +
    (senderEmail ? `My email address is: ${senderEmail}\n\n` : '') +
    `Best regards,\n` +
    (senderEmail || '[Your name]')
  );
  
  const mailtoLink = `mailto:avitalin79@gmail.com?subject=${subject}&body=${body}`;

  // 在新視窗中打開郵件客戶端
  window.open(mailtoLink, '_blank');

  // 顯示提示消息
  showNotification('Opening email window...');
}

// 添加漣漪效果
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;
  
  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${event.clientX - rect.left - radius}px`;
  ripple.style.top = `${event.clientY - rect.top - radius}px`;
  ripple.className = 'ripple';
  
  button.appendChild(ripple);
  
  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}

// 更新初始化函數
function initializeNewsletterForm() {
  const emailInputs = document.querySelectorAll('.newsletter-form input[type="email"]');
  const buttons = document.querySelectorAll('.newsletter-form button');
  
  emailInputs.forEach(input => {
    input.placeholder = 'Enter your email address...';
    
    // 添加輸入動畫
    input.addEventListener('focus', () => {
      input.classList.add('active');
      input.closest('.input-group').classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
      input.classList.remove('active');
      if (!input.value) {
        input.closest('.input-group').classList.remove('focused');
      }
    });
    
    // 即時驗證與動畫
    input.addEventListener('input', () => {
      const isValid = input.validity.valid;
      input.classList.toggle('valid', isValid);
      input.classList.toggle('invalid', !isValid && input.value !== '');
      
      if (isValid) {
        playValidationAnimation(input);
      }
    });
  });
  
  // 添加按鈕效果
  buttons.forEach(button => {
    button.addEventListener('click', createRipple);
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
    });
  });
}

// 驗證動畫
function playValidationAnimation(input) {
  const checkmark = document.createElement('div');
  checkmark.className = 'validation-checkmark';
  input.parentNode.appendChild(checkmark);
  
  setTimeout(() => {
    checkmark.remove();
  }, 1000);
}

// 更新通知樣式
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="icon icon-${type === 'success' ? 'check' : 'warning'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // 添加進場動畫
  notification.style.transform = 'translateX(100%)';
  document.body.appendChild(notification);
  
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// 添加滾動顯示動畫
function initScrollAnimation() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fadeInUp');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  elements.forEach(el => observer.observe(el));
}

// 添加懸浮效果
function initHoverEffects() {
  const cards = document.querySelectorAll('.card, .section-box');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// 添加載入動畫
function initLoadingEffects() {
  document.body.classList.add('loading');
  
  window.addEventListener('load', () => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  });
}

// 初始化所有效果
function initializeEffects() {
  initScrollAnimation();
  initHoverEffects();
  initLoadingEffects();
  initializeNewsletterForm();
}

// 在 DOM 加載完成後初始化
document.addEventListener('DOMContentLoaded', initializeEffects);

// 添加到全局作用域
window.handleSubscribe = handleSubscribe;
window.handleContact = handleContact; 