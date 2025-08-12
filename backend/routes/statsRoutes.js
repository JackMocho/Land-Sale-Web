const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/stats', async (req, res) => {
  try {
    const usersRes = await pool.query('SELECT COUNT(*) FROM "User"');
    const listingsRes = await pool.query('SELECT COUNT(*) FROM "Property" WHERE "isApproved"=true');
    res.json({
      users: parseInt(usersRes.rows[0].count, 10),
      listings: parseInt(listingsRes.rows[0].count, 10)
    });
  } catch (err) {
    console.error('stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;