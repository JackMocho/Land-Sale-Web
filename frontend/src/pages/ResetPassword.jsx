import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await api.post('/auth/reset-password', { token, password });
      setMessage('Password reset! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
          <input
            type="password"
            className="w-full border p-3 rounded mb-4"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full border p-3 rounded mb-4"
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          <button className="w-full bg-blue-900 text-white py-2 rounded" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}