import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

export default function AdminBoundaryApproval() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      api.get('/properties?isApproved=false')
        .then(res => {
          setProperties(res.data.filter(p => p.boundary));
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load properties');
          setLoading(false);
        });
    }
  }, [user]);

  const approveBoundary = async (id) => {
    try {
      await api.put(`/properties/${id}/approve`);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Failed to approve boundary');
    }
  };

  if (authLoading || loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="py-8 px-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Approve Property Boundaries</h1>
      {properties.length === 0 ? (
        <p>No pending boundaries for approval.</p>
      ) : (
        properties.map(property => (
          <div key={property.id} className="mb-8 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">{property.title}</h2>
            <p className="mb-2">{property.location}</p>
            <p className="mb-2 text-sm text-gray-600">Area: {property.boundaryAreaAcres?.toFixed(2) || 'N/A'} acres</p>
            <MapContainer
              style={{ height: 300, width: '100%' }}
              center={property.boundary?.coordinates?.[0]?.[0] ? {
                lat: property.boundary.coordinates[0][0][1],
                lng: property.boundary.coordinates[0][0][0]
              } : { lat: -1.286389, lng: 36.817223 }}
              zoom={16}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {property.boundary && (
                <Polygon
                  positions={property.boundary.coordinates[0].map(([lng, lat]) => [lat, lng])}
                  pathOptions={{ color: 'blue' }}
                >
                  <Popup>
                    {property.title}<br />
                    Area: {property.boundaryAreaAcres?.toFixed(2) || 'N/A'} acres
                  </Popup>
                </Polygon>
              )}
            </MapContainer>
            <button
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => approveBoundary(property.id)}
            >
              Approve Boundary
            </button>
          </div>
        ))
      )}
    </div>
  );
}
