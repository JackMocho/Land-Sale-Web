// src/pages/AdminDashboard.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polygon, Popup } from 'react-leaflet';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [pendingListings, setPendingListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [approvedParcels, setApprovedParcels] = useState([]);
  const [loadingParcels, setLoadingParcels] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchDashboardData = async () => {
      setLoadingStats(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Fetch all properties (including unapproved)
        const allPropsRes = await api.get('/properties');
        if (!statsRes.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsRes.json();
        setStats(statsData);
        // Only show pending listings (isApproved === false)
        setPendingListings(
          Array.isArray(allPropsRes.data)
            ? allPropsRes.data.filter(p => !p.isApproved)
            : []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await api.get('/users');
        const allUsers = Array.isArray(res.data) ? res.data : [];
        setUsers(allUsers.filter(u => !u.isSuspended));
        setSuspendedUsers(allUsers.filter(u => u.isSuspended));
      } catch (err) {
        setUsers([]);
        setSuspendedUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchApprovedParcels = async () => {
      setLoadingParcels(true);
      try {
        const res = await api.get('/properties');
        setApprovedParcels(Array.isArray(res.data) ? res.data.filter(p => p.isApproved) : []);
      } catch {
        setApprovedParcels([]);
      } finally {
        setLoadingParcels(false);
      }
    };

    fetchDashboardData();
    fetchUsers();
    fetchApprovedParcels();
  }, [user]);

  async function handleSuspend(userId) {
    if (window.confirm("Suspend this user?")) {
      await api.put(`/users/${userId}/suspend`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      const res = await api.get('/users');
      const allUsers = Array.isArray(res.data) ? res.data : [];
      setSuspendedUsers(allUsers.filter(u => u.isSuspended));
    }
  }

  async function handleApproveUser(userId) {
    if (window.confirm("Approve this user?")) {
      await api.put(`/users/${userId}/approve`);
      const res = await api.get('/users');
      const allUsers = Array.isArray(res.data) ? res.data : [];
      setUsers(allUsers.filter(u => !u.isSuspended));
      setSuspendedUsers(allUsers.filter(u => u.isSuspended));
    }
  }

  async function handleDelete(userId) {
    if (window.confirm("Delete this user permanently?")) {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSuspendedUsers(prev => prev.filter(u => u.id !== userId));
    }
  }

  async function handleDeleteParcel(parcelId) {
    if (window.confirm("Delete this land parcel permanently?")) {
      await api.delete(`/properties/${parcelId}`);
      setApprovedParcels(prev => prev.filter(p => p.id !== parcelId));
    }
  }

  if (!user) return <div>Redirecting...</div>;
  if (user.role !== 'admin') return <div className="p-8 text-center">Access Denied: Admins Only</div>;

  // Helper to parse coordinates and boundary
  const getMarkerPosition = (coordinates) => {
    if (!coordinates) return null;
    const [lat, lng] = coordinates.split(',').map(Number);
    return [lat, lng];
  };
  const getBoundaryPositions = (boundary) => {
    if (!boundary) return null;
    try {
      const geoJson = typeof boundary === 'string' ? JSON.parse(boundary) : boundary;
      return geoJson.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
    } catch {
      return null;
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
        </div>
        {loadingStats ? (
          <div>Loading stats...</div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {stats && [
                { label: "Total Users", value: stats.users },
                { label: "Total Properties", value: stats.properties },
                { label: "Pending Approvals", value: stats.pending },
                { label: "Total Inquiries", value: stats.inquiries }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow text-center">
                  <h3 className="text-lg text-gray-600">{stat.label}</h3>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Pending Listings */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold mb-4">Listings Awaiting Approval</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Title</th>
                    <th className="text-left py-2">Location</th>
                    <th className="text-left py-2">Price</th>
                    <th className="text-left py-2">Owner</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingListings.map(p => (
                    <tr key={p.id} className="border-b">
                      <td className="py-3">{p.title}</td>
                      <td>{p.location}, {p.county}</td>
                      <td>KES {p.price.toLocaleString()}</td>
                      <td>{p.user_name}</td>
                      <td>
                        <Link to={`/property/${p.id}`} className="text-blue-900 hover:underline mr-4">View</Link>
                        <button 
                          onClick={() => handleApprove(p.id)}
                          className="text-green-600 hover:underline"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Users */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold mb-4">Total Users: {users.length}</h2>
              {loadingUsers ? (
                <p>Loading users...</p>
              ) : users.length === 0 ? (
                <p>No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">County</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{user.name}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">{user.phone || '-'}</td>
                          <td className="px-4 py-2 capitalize">{user.role}</td>
                          <td className="px-4 py-2">{user.county}</td>
                          <td className="px-4 py-2 space-x-2">
                            {(!user.isApproved || user.isSuspended) && (
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                              >
                                Approve
                              </button>
                            )}
                            {user.isApproved && !user.isSuspended && (
                              <button
                                onClick={() => handleSuspend(user.id)}
                                className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                              >
                                Suspend
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Suspended Users */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold mb-4">Suspended Users: {suspendedUsers.length}</h2>
              {loadingUsers ? (
                <p>Loading users...</p>
              ) : suspendedUsers.length === 0 ? (
                <p>No suspended users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">County</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {suspendedUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{user.name}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">{user.phone || '-'}</td>
                          <td className="px-4 py-2 capitalize">{user.role}</td>
                          <td className="px-4 py-2">{user.county}</td>
                          <td className="px-4 py-2 space-x-2">
                            {(!user.isApproved || user.isSuspended) && (
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Approved Parcels Table */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold mb-4">All Approved Land Parcels</h2>
              {loadingParcels ? (
                <p>Loading parcels...</p>
              ) : approvedParcels.length === 0 ? (
                <p>No approved parcels found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Location</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">County</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {approvedParcels.map(parcel => (
                        <tr key={parcel.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{parcel.title}</td>
                          <td className="px-4 py-2">{parcel.location}</td>
                          <td className="px-4 py-2">{parcel.county}</td>
                          <td className="px-4 py-2">KES {parcel.price?.toLocaleString()}</td>
                          <td className="px-4 py-2 space-x-2">
                            <Link
                              to={`/property/${parcel.id}`}
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDeleteParcel(parcel.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Approved Parcels Map */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold mb-4">Approved Land Parcels Map</h2>
              {loadingParcels ? (
                <p>Loading map...</p>
              ) : approvedParcels.length === 0 ? (
                <p>No approved parcels to display.</p>
              ) : (
                <div className="w-full h-96 rounded overflow-hidden">
                  <MapContainer
                    center={[-1.2833, 36.8167]}
                    zoom={7}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    {approvedParcels.map(parcel => {
                      const markerPos = getMarkerPosition(parcel.coordinates);
                      const boundaryPos = getBoundaryPositions(parcel.boundary);
                      return (
                        <React.Fragment key={parcel.id}>
                          {markerPos && (
                            <Marker position={markerPos}>
                              <Popup>
                                <strong>{parcel.title}</strong><br />
                                {parcel.location}<br />
                                {parcel.county}
                              </Popup>
                            </Marker>
                          )}
                          {boundaryPos && (
                            <Polygon
                              positions={boundaryPos}
                              pathOptions={{
                                color: "#2563eb",
                                fillColor: "#93c5fd",
                                fillOpacity: 0.4,
                                weight: 3,
                              }}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </MapContainer>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  async function handleApprove(propertyId) {
    if (!window.confirm("Approve this property listing?")) return;
    try {
      await api.put(`/properties/${propertyId}/approve`);
      setPendingListings(prev => prev.filter(p => p.id !== propertyId));
      // Find the approved property and add to approvedParcels for instant UI update
      setApprovedParcels(prev => {
        const approvedProp = pendingListings.find(p => p.id === propertyId);
        return approvedProp
          ? [...prev, { ...approvedProp, isApproved: true }]
          : prev;
      });
      alert("Property approved!");
    } catch (err) {
      alert("Failed to approve property. Please try again.");
    }
  }
}