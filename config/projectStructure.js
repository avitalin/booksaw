const projectStructure = {
  src: {
    components: {
      common: ['Header', 'Footer', 'Navigation'],
      product: ['ProductCard', 'ProductList', 'ProductDetail'],
      cart: ['CartItem', 'CartSummary', 'CheckoutForm'],
      user: ['Login', 'Register', 'Profile']
    },
    pages: {
      main: ['Home', 'Shop', 'About', 'Contact'],
      product: ['ProductPage', 'CategoryPage'],
      user: ['AccountPage', 'OrderHistory'],
      checkout: ['Cart', 'Checkout', 'OrderConfirmation']
    },
    utils: ['validation', 'formatting', 'helpers'],
    services: ['api', 'auth', 'storage'],
    hooks: ['useCart', 'useAuth', 'useProducts']
  }
}; 