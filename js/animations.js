// Scroll Animation
const animateOnScroll = () => {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (elementTop < windowHeight * 0.8) {
      element.classList.add('animate-fadeInUp');
    }
  });
};

// Navbar Scroll Effect
const handleNavbarScroll = () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
};

// Initialize Animations
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('scroll', () => {
    animateOnScroll();
    handleNavbarScroll();
  });
  
  // Initial Check
  animateOnScroll();
  handleNavbarScroll();
}); 