class ProfileManager {
  constructor() {
    this.form = document.getElementById('profileForm');
    this.initializeForm();
    this.setupEventListeners();
  }

  initializeForm() {
    // Load user data from localStorage or API
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    // Populate form fields
    Object.keys(user).forEach(key => {
      const input = document.getElementById(key);
      if (input) {
        input.value = user[key];
      }
    });
  }

  setupEventListeners() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value
      };

      try {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          // Update local storage
          const user = JSON.parse(localStorage.getItem('user')) || {};
          localStorage.setItem('user', JSON.stringify({
            ...user,
            ...formData
          }));

          // Show success message
          alert('Profile updated successfully!');
        } else {
          const error = await response.json();
          throw new Error(error.message);
        }
      } catch (error) {
        console.error('Profile update error:', error);
        alert('Failed to update profile. Please try again.');
      }
    });

    // Add ZIP code validation
    const zipInput = document.getElementById('zipCode');
    zipInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }
}

export default new ProfileManager(); 