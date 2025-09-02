// controllers/authController.js
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET } = process.env;

// Register user (plain text password)
exports.register = async (req, res) => {
  try {
    const { email, phone, password, name, county, constituency, role } = req.body;
    // Set isVerified to 'false' by default (or 'true' if you want auto-verify)
    const isVerified = 'true';

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

    // Build query: match by email OR phone, and isVerified = true (boolean)
    let query = supabase.from('User').select('*').eq('isVerified', true);
    if (email) {
      query = query.eq('email', email);
    } else if (phone) {
      query = query.eq('phone', phone);
    }
    const { data: user, error } = await query.single();

    if (error || !user) return res.status(400).json({ error: 'Invalid credentials' });
    if (user.password !== password) return res.status(400).json({ error: 'Invalid credentials' });

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
  // 1. Find user by email
  const { data: user } = await supabase.from('User').select('*').eq('email', email).single();
  if (!user) return res.status(404).json({ error: 'User not found' });

  // 2. Generate token & expiry
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  // 3. Save token & expiry to user (add columns if needed)
  await supabase.from('User').update({ resetToken: token, resetTokenExpires: expires }).eq('id', user.id);

  // 4. Send email (pseudo-code, use nodemailer/sendgrid/etc)
  // await sendResetEmail(user.email, `https://your-frontend/reset-password?token=${token}`);

  res.json({ message: 'Password reset link sent to your email.' });
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  // 1. Find user by token and check expiry
  const { data: user } = await supabase
    .from('User')
    .select('*')
    .eq('resetToken', token)
    .gt('resetTokenExpires', new Date().toISOString())
    .single();
  if (!user) return res.status(400).json({ error: 'Invalid or expired token.' });

  // 2. Update password and clear token
  await supabase
    .from('User')
    .update({ password, resetToken: null, resetTokenExpires: null })
    .eq('id', user.id);

  res.json({ message: 'Password has been reset. You can now log in.' });
};