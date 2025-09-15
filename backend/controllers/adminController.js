// controllers/adminController.js
const pool = require('../config/pg');

// Get admin dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [{ rows: users }, { rows: properties }, { rows: pending }, { rows: inquiries }] = await Promise.all([
      pool.query('SELECT id FROM "User"'),
      pool.query('SELECT id FROM "Property"'),
      pool.query('SELECT id FROM "Property" WHERE "isapproved" = FALSE'),
      pool.query('SELECT id FROM "Inquiry"')
    ]);
    res.json({
      users: users ? users.length : 0,
      properties: properties ? properties.length : 0,
      pending: pending ? pending.length : 0,
      inquiries: inquiries ? inquiries.length : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all pending properties (not approved)
exports.getPendingProperties = async (req, res) => {
  try {
    const { rows: properties } = await pool.query(
      'SELECT * FROM "Property" WHERE "isapproved" = FALSE ORDER BY "createdAt" DESC'
    );
    const { rows: users } = await pool.query('SELECT id, name, email FROM "User"');
    // Attach user info to each property
    const enriched = (properties || []).map(p => {
      const user = users.find(u => u.id === p.sellerid) || {};
      return {
        ...p,
        user_name: user.name || null,
        user_email: user.email || null
      };
    });
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};