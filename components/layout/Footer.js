const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-400">
              Providing quality shopping experience for book lovers worldwide.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="text-gray-400 space-y-2">
              <li>Phone: (02) 1234-5678</li>
              <li>Email: service@example.com</li>
              <li>Address: 123 Book Street, New York, NY 10001</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
            <p className="text-gray-400">
              Monday - Friday: 09:00 - 18:00<br />
              Saturday - Sunday: 10:00 - 17:00
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2024 BookSaw. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 