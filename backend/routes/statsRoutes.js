const express = require('express');
const router = express.Router();
const pool = require('../config/pg');

router.get('/', async (req, res) => {
  try {
    const { rows: users } = await pool.query('SELECT COUNT(*) FROM "User"');
    const { rows: listings } = await pool.query('SELECT COUNT(*) FROM "Property" WHERE "isApproved" = TRUE');
    res.json({
      users: parseInt(users[0].count, 10),
      listings: parseInt(listings[0].count, 10)
    });
  } catch (error) {
    console.error('stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;