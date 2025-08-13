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
    const { rows } = await pool.query('SELECT id, name, email, phone, county, role, "isVerified", "createdAt" FROM "User" WHERE id = $1', [parseInt(req.params.id)]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user (Admin or Self)
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, phone, county, role, password } = req.body;

  try {
    // Allow self-edit without role/verification changes
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this user' });
    }

    // Build update query dynamically
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) { fields.push(`name = $${idx++}`); values.push(name); }
    if (email) { fields.push(`email = $${idx++}`); values.push(email); }
    if (phone) { fields.push(`phone = $${idx++}`); values.push(phone); }
    if (county) { fields.push(`county = $${idx++}`); values.push(county); }
    if (role) { fields.push(`role = $${idx++}`); values.push(role); }
    if (password) { fields.push(`password = $${idx++}`); values.push(password); } // store plaintext

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    fields.push(`"updatedAt" = NOW()`);
    const updateQuery = `UPDATE "User" SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    values.push(userId);

    const { rows } = await pool.query(updateQuery, values);
    res.json(rows[0]);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const { rowCount } = await pool.query('DELETE FROM "User" WHERE id = $1', [userId]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
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

exports.getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('User').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};