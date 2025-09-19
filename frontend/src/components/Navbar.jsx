// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="relative z-20">
      {/* Decorative background as in Home.jsx */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/geo8.jpg')",
          backgroundBlendMode: 'multiply',
        }}
        aria-hidden="true"
      />
      <div className="relative container mx-auto flex justify-between items-center py-4 px-4 sm:px-8">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-blue-900 drop-shadow-lg transition-transform duration-300 hover:rotate-[-3deg] hover:scale-110"
        >
          Land Sale
        </Link>
        <div className="space-x-2 sm:space-x-6 flex items-center">
          <Link
            to="/"
            className="relative px-3 py-2 rounded-lg font-semibold text-blue-900 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800 hover:scale-105 hover:rotate-[-2deg] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Home
          </Link>
          {!user && (
            <>
              <Link
                to="/login"
                className="relative px-3 py-2 rounded-lg font-semibold text-blue-900 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800 hover:scale-105 hover:rotate-[-2deg] focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="relative bg-yellow-400 px-4 py-2 rounded-lg font-bold text-blue-900 shadow transition-all duration-200 hover:bg-yellow-500 hover:scale-110 hover:rotate-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                Register
              </Link>
            </>
          )}
          {user && (
            <>
              <span className="text-yellow-600 font-bold px-2">{user.name}</span>
              <button
                onClick={handleLogout}
                className="relative bg-red-500 px-4 py-2 rounded-lg font-bold text-white shadow transition-all duration-200 hover:bg-red-600 hover:scale-110 hover:rotate-1 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}