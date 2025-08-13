// src/pages/Login.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://land-sale-backend.onrender.com';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // for email or phone
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { password };
    if (identifier.includes('@')) {
      payload.email = identifier.trim();
    } else {
      payload.phone = identifier.trim();
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, payload);
      const { user, token } = res.data;
      await login(user, token);

      // Role-based redirect
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'seller' || user.role === 'buyer') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-6 max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome Back</h1>
        <p className="text-center text-gray-600 mb-8">Sign in to manage your land listings</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow">
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Email or Phone</label>
            <input
              type="text"
              name="identifier"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email or phone"
              autoComplete="username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="mb-6 text-right">
            <Link to="/forgot-password" className="text-sm text-blue-900 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-900 font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}