import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { kenyaCounties, constituenciesByCounty } from '../utils/kenyaLocations';

export default function BuyerDashboard() {
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCounty, setSearchCounty] = useState('');
  const [searchConstituency, setSearchConstituency] = useState('');
  const [searching, setSearching] = useState(false);

  // Fetch approved properties, with optional filters
  const fetchApprovedProperties = async (county = '', constituency = '') => {
    setLoading(true);
    try {
      let query = '/properties?isApproved=TRUE';
      if (county) query += `&county=${encodeURIComponent(county)}`;
      if (constituency) query += `&constituency=${encodeURIComponent(constituency)}`;
      const res = await api.get(query);
      setProperties(res.data);
    } catch (err) {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedProperties();
    // eslint-disable-next-line
  }, []);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    await fetchApprovedProperties(searchCounty, searchConstituency);
    setSearching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-gray-100 py-12 relative overflow-x-hidden">
      {/* Decorative background image as in Home.jsx */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/geo8.jpg')",
          backgroundBlendMode: 'multiply',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-900 drop-shadow">Buyer Dashboard</h1>
          <button onClick={logout} className="text-red-600 hover:underline font-semibold"></button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Your Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>County:</strong> {user?.county}</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Search Land Listings</h2>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center">
            <select
              className="flex-1 border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchCounty}
              onChange={e => {
                setSearchCounty(e.target.value);
                setSearchConstituency('');
              }}
            >
              <option value="">Select County</option>
              {kenyaCounties.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
            <select
              className="flex-1 border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchConstituency}
              onChange={e => setSearchConstituency(e.target.value)}
              disabled={!searchCounty}
            >
              <option value="">Select Constituency</option>
              {searchCounty && constituenciesByCounty[searchCounty]?.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition"
              disabled={searching}
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {/* Listings Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-12">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Approved Land Listings</h2>
          {loading ? (
            <p>Loading...</p>
          ) : properties.length === 0 ? (
            <p>No approved properties available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Title</th>
                    <th className="pb-2 hidden sm:table-cell">Location</th>
                    <th className="pb-2 hidden sm:table-cell">County</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2 hidden sm:table-cell">Seller Name</th>
                    <th className="pb-2 hidden sm:table-cell">Seller Phone</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(property => (
                    <tr key={property.id} className="border-b hover:bg-blue-50 transition">
                      <td className="py-3">{property.title}</td>
                      <td className="hidden sm:table-cell">{property.location}</td>
                      <td className="hidden sm:table-cell">{property.county}</td>
                      <td>{property.price?.toLocaleString()}</td>
                      <td>{property.size} {property.sizeUnit}</td>
                      <td className="hidden sm:table-cell">{property.seller_name || 'N/A'}</td>
                      <td className="hidden sm:table-cell">{property.seller_phone || 'N/A'}</td>
                      <td>
                        <Link
                          to={`/property/${property.id}`}
                          className="bg-blue-900 text-white px-3 py-1 rounded text-sm hover:bg-blue-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Surveyor Services Section */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-300 text-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-center">For Survey Services</h2>
          <p className="mb-4 text-center text-lg">A licensed surveyor can assist you with:</p>
          <ul className="list-disc text-white text-base mb-4 pl-6 space-y-1">
            <li>Land boundary identification and demarcation</li>
            <li>Topographical surveys</li>
            <li>Subdivision and amalgamation of land parcels</li>
            <li>Preparation of mutation forms and survey plans</li>
            <li>GIS mapping and geospatial data services</li>
            <li>Land title deed processing support</li>
            <li>Change of user and land use planning</li>
            <li>General land consultancy</li>
          </ul>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold">WhatsApp:</span>
            <a
              href="https://wa.me/254745420900"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-green-200 hover:text-green-400 font-bold"
            >
              0745 420 900
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}