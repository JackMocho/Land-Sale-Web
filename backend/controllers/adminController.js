// controllers/adminController.js
const supabase = require('../config/supabase');

// Get admin dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [{ data: users }, { data: properties }, { data: pending }, { data: inquiries }] = await Promise.all([
      supabase.from('User').select('id'),
      supabase.from('Property').select('id'),
      supabase.from('Property').select('id').eq('isApproved', false),
      supabase.from('Inquiry').select('id')
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
    // Get all pending properties
    const { data: properties, error: propertiesError } = await supabase
      .from('Property')
      .select('*')
      .eq('isApproved', false)
      .order('created_at', { ascending: false });

    if (propertiesError) throw propertiesError;

    // Get all users for mapping owner info
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('id, name, email');

    if (usersError) throw usersError;

    // Attach user info to each property
    const enriched = (properties || []).map(p => {
      const user = users?.find(u => u.id === p.ownerId) || {};
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