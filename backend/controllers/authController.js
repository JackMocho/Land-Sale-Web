// controllers/authController.js
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, phone, password, county, constituency, role } = req.body;

  if (!email || !phone || !password || !name) {
    return res.status(400).json({ message: 'Name, email, phone, and password are required.' });
  }

  try {
    // Check if email or phone already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('User')
      .select('*')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone already registered.' });
    }

    // Store user (isVerified can be set to TRUE for testing)
    const { data: newUser, error: insertError } = await supabase
      .from('User')
      .insert([
        {
          name,
          email,
          phone,
          password,
          county: county || null,
          constituency: constituency || null,
          role: role || 'buyer',
          isVerified: true
        }
      ])
      .select('id, name, email, phone, county, constituency, role, isVerified')
      .single();

    if (insertError) {
      throw insertError;
    }

    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .or(`email.eq.${identifier},phone.eq.${identifier}`)
      .single();

    if (userError || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified. Please contact admin.' });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        county: user.county,
        constituency: user.constituency
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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