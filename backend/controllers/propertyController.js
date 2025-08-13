// controllers/propertyController.js
const supabase = require('../config/supabase');

// Get all properties (with optional filters)
exports.getProperties = async (req, res) => {
  try {
    let query = supabase.from('Property').select('*');
    if (req.query.isApproved) {
      // Make sure your column is named exactly 'isApproved' (case-sensitive)
      query = query.eq('isApproved', req.query.isApproved === 'true');
    }
    const { data, error } = await query;
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    console.error('getProperties error:', err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('Property').select('*').eq('id', id).single();
    if (error || !data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

// Create property
exports.createProperty = async (req, res) => {
  try {
    // Make sure req.body contains all required fields for your Property table
    const { data, error } = await supabase.from('Property').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Create property error:', err); // <--- Add this for debugging
    res.status(500).json({ error: 'Failed to create property' });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('Property').update(req.body).eq('id', id).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update property' });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('Property').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
};