// controllers/authController.js
const pool = require('../config/pg');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Register user (plain text password)
exports.register = async (req, res) => {
  try {
    const { email, phone, password, name, county, constituency, role } = req.body;
    const isVerified = true;

    // Check for existing user
    const { rows: existingUser } = await pool.query(
      'SELECT id FROM "User" WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    if (existingUser.length > 0) return res.status(400).json({ error: 'Email or phone already exists' });

    const { rows } = await pool.query(
      `INSERT INTO "User" (email, phone, password, name, county, constituency, role, isVerified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [email, phone, password, name, county, constituency, role || 'buyer', isVerified]
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user (plain text password check)
// Allow login with email OR phone, only if isVerified = 'true'
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    let queryStr = 'SELECT * FROM "User" WHERE "isVerified" = TRUE';
    let params = [];
    if (email) {
      queryStr += ' AND email = $1';
      params = [email];
    } else if (phone) {
      queryStr += ' AND phone = $1';
      params = [phone];
    } else {
      return res.status(400).json({ error: 'Email or phone required' });
    }
    const { rows } = await pool.query(queryStr, params);
    const user = rows[0];
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
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

// Example
const login = (user, token) => {
  setUser(user);
  localStorage.setItem('token', token);
  // Do NOT set password to token
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const { rows } = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
  const user = rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await pool.query(
    'UPDATE "User" SET "resetToken" = $1, "resetTokenExpires" = $2 WHERE id = $3',
    [token, expires, user.id]
  );

  // TODO: Send email with reset link

  res.json({ message: 'Password reset link sent to your email.' });
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const now = new Date();
  const { rows } = await pool.query(
    'SELECT * FROM "User" WHERE "resetToken" = $1 AND "resetTokenExpires" > $2',
    [token, now]
  );
  const user = rows[0];
  if (!user) return res.status(400).json({ error: 'Invalid or expired token.' });

  await pool.query(
    'UPDATE "User" SET password = $1, "resetToken" = NULL, "resetTokenExpires" = NULL WHERE id = $2',
    [password, user.id]
  );

  res.json({ message: 'Password has been reset. You can now log in.' });
};