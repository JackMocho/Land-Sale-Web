const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.get('/stats', async (req, res) => {
  try {
    const { data: users, error: userError } = await supabase.from('User').select('id');
    const { data: listings, error: listingError } = await supabase.from('Property').select('id').eq('isApproved', true);

    if (userError || listingError) {
      console.error('Supabase error:', userError || listingError);
      return res.status(500).json({ error: (userError || listingError).message });
    }

    res.json({
      users: users ? users.length : 0,
      listings: listings ? listings.length : 0
    });
  } catch (err) {
    console.error('stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;