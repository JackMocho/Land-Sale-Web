import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function BuyerDashboard() {
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch only approved properties
    async function fetchApprovedProperties() {
      try {
        const res = await api.get('/properties?isApproved=TRUE');
        setProperties(res.data);
      } catch (err) {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }
    fetchApprovedProperties();
  }, []);

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
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
          <h2 className="text-xl font-semibold mb-4">Approved Land Listings</h2>
          {loading ? (
            <p>Loading...</p>
          ) : properties.length === 0 ? (
            <p>No approved properties available.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Location</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Size</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(property => (
                  <tr key={property.id} className="border-b">
                    <td className="py-3">{property.title}</td>
                    <td>{property.location}</td>
                    <td>{property.price?.toLocaleString()}</td>
                    <td>{property.size} {property.sizeUnit}</td>
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
          )}
        </div>
      </div>
    </div>
  );
}