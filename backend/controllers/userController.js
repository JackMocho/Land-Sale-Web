// controllers/userController.js
const supabase = require('../config/supabase');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('User').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('User').select('*').eq('id', id).single();
    if (error || !data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { data, error } = await supabase.from('User').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('User').update(req.body).eq('id', id).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('User').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get users with optional approval filter
exports.getUsers = async (req, res) => {
  try {
    let query = supabase.from('User').select('*');
    if (req.query.isApproved === 'false') {
      query = query.eq('isApproved', false);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};