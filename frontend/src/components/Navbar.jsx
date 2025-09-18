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
    <nav className="bg-gradient-to-bl from-slate-950 to-red-950 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Land Sales</Link>
        <div className="space-x-6 flex items-center">
          <Link to="/" className="hover:underline">Home</Link>
          {!user && (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 text-blue-900 font-semibold">Register</Link>
            </>
          )}
          {user && (
            <>
              <span className="text-yellow-300 font-semibold">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 text-white font-semibold"
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