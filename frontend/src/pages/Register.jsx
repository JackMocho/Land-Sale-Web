// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { kenyaCounties, constituenciesByCounty } from '../utils/kenyaLocations';
import api from '../services/api';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    county: '',
    constituency: '',
    role: 'buyer',
    password: '',
    confirmPassword: ''
  });

  // Add state for showing/hiding passwords
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset constituency when county changes
    if (name === 'county') {
      setFormData(prev => ({ ...prev, constituency: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Password and Confirm Password must match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', formData);
      setSuccess('Registration successful! You can now log in.');
      // Redirect to homepage after successful registration
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-gray-600">Join Kenya's trusted land marketplace</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="John Kamau"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="you@domain.com"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 mb-2">Phone (254...)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="254712345678"
              required
            />
          </div>

          {/* County */}
          <div>
            <label className="block text-gray-700 mb-2">County</label>
            <select
              name="county"
              value={formData.county}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select Your County</option>
              {kenyaCounties.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>

          {/* Constituency */}
          <div>
            <label className="block text-gray-700 mb-2">Constituency</label>
            <select
              name="constituency"
              value={formData.constituency}
              onChange={handleChange}
              disabled={!formData.county}
              className={`w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none ${!formData.county ? 'bg-gray-100' : ''}`}
            >
              <option value="">{formData.county ? 'Select Constituency' : 'Select County First'}</option>
              {formData.county && constituenciesByCounty[formData.county]?.map(constituency => (
                <option key={constituency} value={constituency}>{constituency}</option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-700 mb-2">I am a...</label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={formData.role === 'buyer'}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-blue-900"
                />
                <span>Buyer</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={formData.role === 'seller'}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-blue-900"
                />
                <span>Seller</span>
              </label>
              
            </div>
          </div>

          {/* Password with show/hide tab */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {/* Show/Hide Password Tab */}
          <div className="flex items-center mt-2">
            <input
              id="showPassword"
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword((prev) => !prev)}
              className="mr-2"
            />
            <label htmlFor="showPassword" className="text-sm text-gray-700 cursor-pointer">
              Show Passwords
            </label>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="secondary" fullWidth disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}