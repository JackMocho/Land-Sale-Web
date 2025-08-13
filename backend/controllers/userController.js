// controllers/userController.js
const pool = require('../config/db');
const supabase = require('../config/supabase');

// @desc    Get all users (Admin only)
// @route   GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { rows: users } = await pool.query('SELECT id, name, email, phone, county, role, "isVerified", "createdAt" FROM "User" ORDER BY "createdAt" DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
exports.getMyProfile = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, phone, county, role, "isVerified", "createdAt" FROM "User" WHERE id = $1', [req.user.id]);
    const user = rows[0];
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
exports.updateMyProfile = async (req, res) => {
  const { name, email, phone, county } = req.body;

  try {
    const updateQuery = 'UPDATE "User" SET name=$1, email=$2, phone=$3, county=$4, "updatedAt"=NOW() WHERE id=$5 RETURNING id, name, email, phone, county, role';
    const { rows: updatedRows } = await pool.query(updateQuery, [name, email, phone, county, req.user.id]);
    const user = updatedRows[0];
    res.json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('User').select('*').eq('id', id).single();
    if (error || !data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    console.error('getUserById error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// @desc    Create user
// @route   POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { data, error } = await supabase.from('User').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// @desc    Update user (Admin or Self)
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('User').update(req.body).eq('id', id).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('User').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// @desc    Approve user
// @route   PUT /api/users/approve/:id
exports.approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE "User" SET "isSuspended"=false, "isApproved"=true WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

// @desc    Suspend user
// @route   PUT /api/users/suspend/:id
exports.suspendUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE "User" SET "isSuspended"=true, "isApproved"=false WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to suspend user' });
  }
};