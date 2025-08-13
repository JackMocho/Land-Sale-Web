// controllers/authController.js
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Register user (plain text password)
exports.register = async (req, res) => {
  try {
    const { email, phone, password, name, county, constituency, role } = req.body;
    // Set isVerified to 'false' by default (or 'true' if you want auto-verify)
    const isVerified = 'false';

    // Check for existing user
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .maybeSingle();

    if (existingUser) return res.status(400).json({ error: 'Email or phone already exists' });

    const { data, error } = await supabase.from('User').insert([
      { email, phone, password, name, county, constituency, role: role || 'buyer', isVerified }
    ]).select();

    if (error) throw error;

    res.status(201).json({ user: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user (plain text password check)
// Allow login with email OR phone, only if isVerified = 'true'
exports.login = async (req, res) => {
  try {
    let { email, phone, password } = req.body;
    email = email && email.trim() ? email.trim() : null;
    phone = phone && phone.trim() ? phone.trim() : null;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ error: 'Email or phone and password required' });
    }

    let query = supabase.from('User').select('*').eq('isVerified', 'true');
    if (email) {
      query = query.eq('email', email);
    } else if (phone) {
      query = query.eq('phone', phone);
    }
    const { data: user, error } = await query.single();

    if (error || !user) return res.status(400).json({ error: 'Invalid credentials' });
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