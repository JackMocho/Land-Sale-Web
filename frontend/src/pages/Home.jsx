// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { kenyaCounties, constituenciesByCounty } from '../utils/kenyaLocations';
import { useAuth } from '../context/AuthContext';
import AboutUs from './AboutUs';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [approvedProperties, setApprovedProperties] = useState([]);
  const [stats, setStats] = useState({ users: 0, listings: 0 });
  const [searchCounty, setSearchCounty] = useState('');
  const [searchConstituency, setSearchConstituency] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch system stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const statsRes = await api.get('/stats');
        setStats({
          users: statsRes.data.users,
          listings: statsRes.data.listings,
        });
      } catch {
        setStats({ users: 0, listings: 0 });
      }
    }
    fetchStats();
  }, []);

  // Fetch 6 random approved properties for Featured section
  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      try {
        const res = await api.get('/properties?isApproved=TRUE');
        let properties = Array.isArray(res.data) ? res.data : [];
        // Shuffle and pick 3
        properties = properties.sort(() => 0.5 - Math.random()).slice(0, 3);
        setApprovedProperties(properties);
      } catch {
        setApprovedProperties([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = [];
      if (searchCounty) params.push(`county=${encodeURIComponent(searchCounty)}`);
      if (searchConstituency) params.push(`constituency=${encodeURIComponent(searchConstituency)}`);
      params.push('isApproved=true');
      const res = await api.get(`/properties?${params.join('&')}`);
      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Modern homepage styles
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-900">
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Modern Call to Action */}
        <section className="flex flex-col-reverse md:flex-row items-center justify-between mb-12 gap-8">
          <div className="md:w-1/2 flex flex-col items-start">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-4 tracking-tight leading-tight"
              style={{ textShadow: '0 2px 8px rgba(59,130,246,0.15)' }}>
              Find Your Perfect Land Parcel in Kenya
            </h1>
            <p className="text-lg text-gray-700 mb-6 opacity-90">
              Discover, search, and list land parcels across all counties and constituencies. Trusted by thousands of sellers and investors.
            </p>
            <Link
              to="/register"
              className="bg-blue-900 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 hover:-translate-y-1 text-lg mb-4 animate-pulse"
              style={{ animationDuration: '2s' }}
            >
              List Your Land Now
            </Link>
            
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img
              src="/assets/wallpaper.png"
              alt="Kenya Land"
              className="rounded-2xl shadow-2xl w-full max-w-md opacity-95 transform hover:scale-105 transition-transform duration-500"
              style={{ boxShadow: '0 8px 32px rgba(59,130,246,0.15)' }}
              loading="eager"
              fetchpriority="high"
            />
          </div>
        </section>

        {/* Listings Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Featured Land Parcels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(searchResults.length > 0 ? searchResults : approvedProperties).map(listing => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col transition hover:scale-105 hover:shadow-2xl opacity-95"
              >
                <div className="mb-4 relative">
                  {Array.isArray(listing.images) && listing.images.length > 0 && listing.images[0] ? (
                    <img
                      src={listing.images[0]}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg bg-gray-100"
                      style={{ transition: 'transform 0.3s', transform: 'scale(1)' }}
                      onError={e => { e.target.onerror = null; e.target.src = '/assets/wallpaper.png'; }}
                      loading="lazy"
                      fetchpriority="low"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center rounded-lg bg-gray-100">
                      <span className="text-gray-400 text-lg">No Image Available</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-60 backdrop-blur-md rounded px-3 py-2">
                    <span className="text-lg font-bold text-blue-900">{listing.title}</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-1">{listing.location}, {listing.county}</p>
                <p className="text-gray-700 mb-1">KES {listing.price?.toLocaleString()}</p>
                {user ? (
                  <Link
                    to={`/property/${listing.id}`}
                    className="mt-4 bg-blue-900 text-white py-2 px-6 rounded-lg font-semibold text-center hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                ) : (
                  <button
                    className="mt-4 bg-blue-900 text-white py-2 px-6 rounded-lg font-semibold text-center hover:bg-blue-700 transition"
                    onClick={() => navigate('/register')}
                  >
                    Register to View this property
                  </button>
                )}
              </div>
            ))}
            {(searchResults.length === 0 && approvedProperties.length === 0) && (
              <div className="col-span-full text-center text-gray-500 py-12">
                No approved land parcels found.
              </div>
            )}
          </div>
        </section>

        {/* About Us Section (contacts removed) */}
        <section className="mb-12">
          <AboutUs />
        </section>
      </div>
      {/* Stats at the bottom */}
      <div className="w-full py-8 bg-blue-900 text-white text-center mt-12 opacity-95">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8">
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center transition hover:scale-105 hover:shadow-2xl">
            <span className="text-4xl font-bold text-blue-900">{stats.users}</span>
            <span className="text-lg text-gray-600 mt-2">Total Users</span>
          </div>
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center transition hover:scale-105 hover:shadow-2xl">
            <span className="text-4xl font-bold text-blue-900">{stats.listings}</span>
            <span className="text-lg text-gray-600 mt-2">Total Listings</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}