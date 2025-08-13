// controllers/authController.js
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Register user (plain text password)
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const { data: existingUser } = await supabase.from('User').select('id').eq('email', email).single();
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    // Store password as plain text (NOT recommended for production)
    const { data, error } = await supabase.from('User').insert([{ email, password, name, phone }]).select();
    if (error) throw error;

    const token = jwt.sign({ id: data[0].id, email: data[0].email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: data[0], token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user (plain text password check)
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    // Require either email or phone, and password
    if ((!email && !phone) || !password) {
      return res.status(400).json({ error: 'Email or phone and password required' });
    }

    // Build query: match by email OR phone
    let query = supabase.from('User').select('*');
    if (email) {
      query = query.eq('email', email);
    } else if (phone) {
      query = query.eq('phone', phone);
    }
    const { data: user } = await query.single();

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (user.password !== password) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { rows } = await pool.query('SELECT id, name, email, phone, county, role FROM "User" WHERE id = $1', [userId]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};