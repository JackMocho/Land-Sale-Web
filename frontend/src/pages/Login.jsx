// src/pages/Login.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button';
import axios from 'axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Only send email if filled, otherwise send phone
    const payload = { password };
    if (email) payload.email = email;
    else if (phone) payload.phone = phone;

    try {
      // Example using axios
      await axios.post('/api/auth/login', payload);
      
      const user = await login(email || phone, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'seller' || user.role === 'buyer') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
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
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="you@domain.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="1234567890"
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