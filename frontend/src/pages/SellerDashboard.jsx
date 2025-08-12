import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchSellerListings() {
      setLoading(true);
      try {
        // Fetch listings for the logged-in seller
        const res = await api.get(`/properties?sellerId=${user.id}`);
        // Ensure images is always an array and URLs are absolute
        const fixedListings = (Array.isArray(res.data) ? res.data : []).map(listing => {
          let images = [];
          if (Array.isArray(listing.images)) {
            images = listing.images;
          } else if (typeof listing.images === 'string' && listing.images.length > 0) {
            try {
              images = JSON.parse(listing.images);
            } catch {
              images = [listing.images];
            }
          }
          // Prefix /uploads/ with backend URL
          const fixedImages = images.map(url =>
            url && url.startsWith('/uploads/')
              ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`
              : url
          );
          return { ...listing, images: fixedImages };
        });
        setListings(fixedListings);
      } catch (err) {
        setListings([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSellerListings();
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please log in to view your dashboard.</div>;

  return (
    <div className="py-12 bg-gradient-to-tl from-blue-100 to-blue-500 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>County:</strong> {user?.county}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Listings</h2>
            <Link
              to="/list-new"
              className="bg-blue-900 text-white px-4 py-2 rounded text-sm hover:bg-blue-800"
            >
              + New Listing
            </Link>
          </div>
          {loading ? (
            <p>Loading your listings...</p>
          ) : listings.length === 0 ? (
            <p className="text-gray-600">You have not listed any properties yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map(listing => (
                <div key={listing.id} className="bg-white rounded-lg shadow p-4">
                  <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
                  <p className="text-gray-700 mb-1">{listing.location}, {listing.county}</p>
                  <p className="text-gray-700 mb-1">KES {listing.price?.toLocaleString()}</p>
                  <div className="mb-2">
                    {/* Render first image if available */}
                    {Array.isArray(listing.images) && listing.images.length > 0 && listing.images[0] && (
                      <img
                        src={listing.images[0]}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="flex gap-3 mt-2">
                    <Link
                      to={`/property/${listing.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      View
                    </Link>
                    {/* Add edit/delete buttons if needed */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}