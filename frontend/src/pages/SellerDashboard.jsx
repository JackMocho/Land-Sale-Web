import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PropertyForm from './PropertyForm';

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Fetch only properties listed by this seller
  const fetchSellerProperties = async () => {
    setLoading(true);
    try {
      // Use lowercase 'sellerid' to match backend query param
      const res = await api.get(`/properties?sellerid=${user?.id}`);
      setProperties(res.data);
    } catch (err) {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchSellerProperties();
    // eslint-disable-next-line
  }, [user?.id]);

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 to-gray-100 py-12 relative overflow-x-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-20 pointer-events-none"
          style={{
            backgroundImage: "url('/assets/geo8.jpg')",
            backgroundBlendMode: 'multiply',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 container mx-auto px-4">
          <button
            onClick={() => setShowForm(false)}
            className="mb-6 bg-blue-900 text-white px-4 py-2 rounded shadow hover:bg-blue-800"
          >
            ← Back to Dashboard
          </button>
          <PropertyForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-gray-100 py-12 relative overflow-x-hidden">
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
          <h1 className="text-3xl font-bold text-blue-900 drop-shadow">Seller Dashboard</h1>
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

        {/* Seller's Properties Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold text-blue-900">Your Land Listings</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition"
            >
              + Add New Property
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You have not listed any properties yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Location</th>
                    <th className="pb-2">County</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(property => (
                    <tr key={property.id} className="border-b hover:bg-blue-50 transition">
                      <td className="py-3">{property.title}</td>
                      <td>{property.location}</td>
                      <td>{property.county}</td>
                      <td>{property.price?.toLocaleString()}</td>
                      <td>{property.size} {property.sizeUnit}</td>
                      <td>
                        {property.isApproved
                          ? <span className="text-green-600 font-semibold">Approved</span>
                          : <span className="text-yellow-600 font-semibold">Pending</span>
                        }
                      </td>
                      <td>
                        <Link
                          to={`/property/${property.id}`}
                          className="bg-blue-900 text-white px-3 py-1 rounded text-sm hover:bg-blue-800 mr-2"
                        >
                          View
                        </Link>
                        <Link
                          to={`/edit-property/${property.id}`}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Seller Tips Section */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-300 text-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-center">Tips for Successful Land Sales</h2>
          <ul className="list-disc text-white text-base mb-4 pl-6 space-y-1">
            <li>Ensure your property details are accurate and up-to-date.</li>
            <li>Upload clear photos and documents for faster approval.</li>
            <li>Respond promptly to buyer inquiries.</li>
            <li>Be transparent about land ownership and documentation.</li>
            <li>Consult a licensed surveyor for boundary and title issues.</li>
          </ul>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold">Need help?</span>
            <a
              href="https://wa.me/254745420900"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-green-200 hover:text-green-400 font-bold"
            >
              WhatsApp: 0745 420 900
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}