// src/components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        

        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
  
            <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
            <li><Link to="/register" className="hover:text-white transition">Register</Link></li>
            <li><Link to="#" className="hover:text-white transition">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Contact & Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li>📞 +254 745 420 900</li>
            <li>📧 emissarygeospatial@gmail.com</li>
            <li>📍 Nairobi, Kenya</li>
          </ul>
          <div className="mt-4">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Emissary Geospatials. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}