// controllers/authController.js
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

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
    const checkQuery = 'SELECT * FROM "User" WHERE email = $1 OR phone = $2 LIMIT 1';
    const { rows } = await pool.query(checkQuery, [email, phone]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'Email or phone already registered.' });
    }

    // Store user (isVerified can be set to TRUE for testing)
    const insertQuery = `
      INSERT INTO "User" (name, email, phone, password, county, constituency, role, "isVerified")
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      RETURNING id, name, email, phone, county, constituency, role, "isVerified"
    `;
    const values = [name, email, phone, password, county || null, constituency || null, role || 'buyer'];
    const result = await pool.query(insertQuery, values);

    res.status(201).json({ user: result.rows[0] });
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
    const userQuery = `
      SELECT * FROM "User"
      WHERE email = $1 OR phone = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(userQuery, [identifier]);
    const user = rows[0];

    if (!user) {
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