// controllers/propertyController.js
const pool = require('../config/db');
const turf = require('@turf/turf');
const supabase = require('../config/supabase');

// Get all properties (with optional filters)
exports.getProperties = async (req, res) => {
  try {
    let query = supabase.from('Property').select('*');

    if (req.query.isApproved) {
      query = query.eq('isApproved', req.query.isApproved === 'true');
    }
    if (req.query.county) {
      query = query.eq('county', req.query.county);
    }
    if (req.query.constituency) {
      query = query.eq('constituency', req.query.constituency);
    }

    const { data, error } = await query;
    if (error) throw error;

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
    console.error('getPropertyById error:', err);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

// Create property
exports.createProperty = async (req, res) => {
  try {
    const { data, error } = await supabase.from('Property').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('createProperty error:', err);
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
    console.error('updateProperty error:', err);
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
    console.error('deleteProperty error:', err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
};