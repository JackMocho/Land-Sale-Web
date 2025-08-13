// controllers/inquiryController.js
const supabase = require('../config/supabase');

// Get all inquiries
exports.getInquiries = async (req, res) => {
  try {
    const { data, error } = await supabase.from('Inquiry').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
};

// Get inquiry by ID
exports.getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('Inquiry').select('*').eq('id', id).single();
    if (error || !data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inquiry' });
  }
};

// Create inquiry
exports.createInquiry = async (req, res) => {
  try {
    const { data, error } = await supabase.from('Inquiry').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
};

// Update inquiry
exports.updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('Inquiry').update(req.body).eq('id', id).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
};

// Delete inquiry
exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('Inquiry').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
};

// Get all inquiries for a property (owner only)
exports.getInquiriesByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { data, error } = await supabase
      .from('Inquiry')
      .select('*')
      .eq('propertyId', propertyId);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inquiries for property' });
  }
};

// Get all inquiries made by logged-in user
exports.getMyInquiries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('Inquiry')
      .select('*')
      .eq('userId', userId);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your inquiries' });
  }
};