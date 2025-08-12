import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminUserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [editData, setEditData] = useState({ name: '', email: '', role: '' });

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/users')
        .then(res => {
          setUsers(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load users');
          setLoading(false);
        });
    }
  }, [user]);

  const handleEdit = (u) => {
    setEditUserId(u.id);
    setEditData({ name: u.name, email: u.email, role: u.role });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/users/${editUserId}`, editData);
      setUsers(users.map(u => u.id === editUserId ? { ...u, ...editData } : u));
      setEditUserId(null);
    } catch {
      alert('Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch {
      alert('Failed to delete user');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b">
              <td className="p-2 border">
                {editUserId === u.id ? (
                  <input name="name" value={editData.name} onChange={handleEditChange} className="border p-1 rounded" />
                ) : u.name}
              </td>
              <td className="p-2 border">
                {editUserId === u.id ? (
                  <input name="email" value={editData.email} onChange={handleEditChange} className="border p-1 rounded" />
                ) : u.email}
              </td>
              <td className="p-2 border">
                {editUserId === u.id ? (
                  <select name="role" value={editData.role} onChange={handleEditChange} className="border p-1 rounded">
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : u.role}
              </td>
              <td className="p-2 border">
                {editUserId === u.id ? (
                  <>
                    <button className="bg-green-600 text-white px-2 py-1 rounded mr-2" onClick={handleEditSave}>Save</button>
                    <button className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setEditUserId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="bg-blue-600 text-white px-2 py-1 rounded mr-2" onClick={() => handleEdit(u)}>Edit</button>
                    <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDelete(u.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
