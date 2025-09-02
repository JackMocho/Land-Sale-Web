import { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('If your email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link.');
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
          <input
            type="email"
            className="w-full border p-3 rounded mb-4"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button className="w-full bg-blue-900 text-white py-2 rounded" type="submit">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}