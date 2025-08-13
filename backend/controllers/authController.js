// controllers/authController.js
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = process.env;

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const { data: existingUser } = await supabase.from('User').select('id').eq('email', email).single();
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from('User').insert([{ email, password: hashedPassword, name, phone }]).select();
    if (error) throw error;

    const token = jwt.sign({ id: data[0].id, email: data[0].email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: data[0], token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user } = await supabase.from('User').select('*').eq('email', email).single();
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

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