// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { kenyaCounties, constituenciesByCounty } from '../utils/kenyaLocations';
import { useAuth } from '../context/AuthContext';
import AboutUs from './AboutUs';

// List of survey images for the gallery/slider section
const surveyImages = [
  '/assets/geo1.jpg',
  '/assets/geo2.jpg',
  '/assets/geo3.jpg',
  '/assets/geo4.jpg',
  '/assets/geo5.jpg',
  '/assets/geo6.jpg',
  '/assets/geo7.jpg',
  '/assets/geo9.jpg'
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [approvedProperties, setApprovedProperties] = useState([]);
  const [stats, setStats] = useState({ users: 0, listings: 0 });
  const [loading, setLoading] = useState(false);
  const [currentGallery, setCurrentGallery] = useState(0);

  // Gallery image auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGallery((prev) => (prev + 1) % surveyImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

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

  // Kenyan land law quotations
  const statuteQuotes = [
    {
      quote: "“No land or interest in land may be disposed of except in accordance with the Land Act or any other written law.”",
      source: "— Land Act, 2012 (Kenya), Section 3"
    },
    {
      quote: "“A person shall not sell, transfer, lease or otherwise dispose of any land unless that person has a valid title to the land.”",
      source: "— Land Registration Act, 2012 (Kenya), Section 26"
    },
    {
      quote: "“All dealings in land must be in writing, signed by the parties and attested.”",
      source: "— Land Registration Act, 2012 (Kenya), Section 38"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-200 to-gray-100 overflow-x-hidden">
      {/* Main background image (geo8) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/geo8.jpg')",
          backgroundBlendMode: 'multiply',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Caution Banner */}
        <div className="mb-6">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded-lg shadow flex items-center gap-4">
            <svg className="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" />
            </svg>
            <span>
              <strong>Important:</strong> This platform <span className="underline font-semibold">DOES NOT handle any financial transactions</span>. All land transactions must be conducted in accordance with Kenyan law and verified independently. Always consult a licensed land surveyor and legal professional before making any commitments.
            </span>
          </div>
        </div>

        {/* Modern Call to Action */}
        <section className="flex flex-col-reverse md:flex-row items-center justify-between mb-12 gap-8">
          <div className="md:w-1/2 flex flex-col items-start">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-4 tracking-tight leading-tight drop-shadow-lg"
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
          
        </section>

        {/* Survey Tools Gallery/Slider */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-blue-900 mb-4 text-center">WELCOME </h2>
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-2xl h-64 rounded-xl overflow-hidden shadow-lg mb-4">
              <img
                src={surveyImages[currentGallery]}
                alt={`Survey Tool ${currentGallery + 1}`}
                className="object-cover w-full h-full transition-all duration-700"
                style={{ borderRadius: '1rem' }}
              />
              <div className="absolute bottom-2 right-2 bg-white bg-opacity-70 rounded px-3 py-1 text-blue-900 text-xs">
                {`Image ${currentGallery + 1}`}
              </div>
            </div>
            <div className="flex gap-2">
              {surveyImages.map((img, idx) => (
                <button
                  key={img}
                  className={`w-4 h-4 rounded-full border-2 ${currentGallery === idx ? 'bg-blue-700 border-blue-900' : 'bg-white border-blue-300'}`}
                  onClick={() => setCurrentGallery(idx)}
                  aria-label={`Show image ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Statute Quotations */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-blue-900 mb-4 text-center">Kenyan Land Laws and Statutes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statuteQuotes.map((q, idx) => (
              <blockquote
                key={idx}
                className="bg-white bg-opacity-90 rounded-xl shadow-md p-6 border-l-4 border-blue-700 text-gray-800 flex flex-col justify-between"
              >
                <span className="italic mb-2">&ldquo;{q.quote}&rdquo;</span>
                <span className="text-sm text-blue-700 font-semibold mt-2">{q.source}</span>
              </blockquote>
            ))}
          </div>
        </section>

        {/* Listings Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Featured Land Parcels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {approvedProperties.map(listing => (
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
            {approvedProperties.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-12">
                No approved land parcels found.
              </div>
            )}
          </div>
        </section>

        {/* About Us Section */}
        <section className="mb-12">
          <AboutUs />
        </section>
      </div>
      {/* Stats at the bottom */}
      <div className="w-full py-8 bg-gradient-to-bl from-blue-900 to-gray-100 text-white text-center mt-12 opacity-95">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8">
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center transition hover:scale-105 hover:shadow-2xl">
            <span className="text-4xl font-bold text-blue-900">{stats.users}</span>
            <span className="text-lg text-gray-600 mt-2">System Users</span>
          </div>
          <div className="bg-white rounded-full shadow-lg px-8 py-6 flex flex-col items-center transition hover:scale-105 hover:shadow-2xl">
            <span className="text-4xl font-bold text-blue-900">{stats.listings}</span>
            <span className="text-lg text-gray-600 mt-2">Available Parcels</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}