// controllers/adminController.js
const pool = require('../config/db');

// Get admin dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [usersResult, propertiesResult, pendingResult, inquiriesResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM "User"'),
      pool.query('SELECT COUNT(*) FROM "Property"'),
      pool.query('SELECT COUNT(*) FROM "Property" WHERE "isApproved" = false'),
      pool.query('SELECT COUNT(*) FROM "Inquiry"')
    ]);

    res.json({
      users: parseInt(usersResult.rows[0].count, 10),
      properties: parseInt(propertiesResult.rows[0].count, 10),
      pending: parseInt(pendingResult.rows[0].count, 10),
      inquiries: parseInt(inquiriesResult.rows[0].count, 10)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all pending properties (not approved)
exports.getPendingProperties = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name AS user_name, u.email AS user_email
       FROM "Property" p
       LEFT JOIN "User" u ON p."ownerId" = u.id
       WHERE p."isApproved" = false
       ORDER BY p."createdAt" DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};