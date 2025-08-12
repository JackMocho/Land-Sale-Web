// controllers/inquiryController.js
const pool = require('../config/db');

// Create an inquiry for a property
exports.createInquiry = async (req, res) => {
  const { propertyId, message } = req.body;
  if (!propertyId || !message) {
    return res.status(400).json({ message: 'Property ID and message are required.' });
  }
  try {
    const insertQuery = `
      INSERT INTO "Inquiry" ("userId", "propertyId", message, "createdAt")
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const values = [req.user.id, propertyId, message];
    const { rows } = await pool.query(insertQuery, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create inquiry', error: error.message });
  }
};

// Get all inquiries for a property (owner only)
exports.getInquiriesByProperty = async (req, res) => {
  const propertyId = parseInt(req.params.propertyId);
  try {
    // Check if the requester is the owner of the property
    const propertyResult = await pool.query('SELECT * FROM "Property" WHERE id = $1', [propertyId]);
    const property = propertyResult.rows[0];
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const inquiriesResult = await pool.query(
      `SELECT i.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
       FROM "Inquiry" i
       LEFT JOIN "User" u ON i."userId" = u.id
       WHERE i."propertyId" = $1
       ORDER BY i."createdAt" DESC`,
      [propertyId]
    );
    res.json(inquiriesResult.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get inquiries', error: error.message });
  }
};

// Get all inquiries made by logged-in user
exports.getMyInquiries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.title, p.location, p.price, p.images
       FROM "Inquiry" i
       JOIN "Property" p ON i."propertyId" = p.id
       WHERE i."userId" = $1
       ORDER BY i."createdAt" DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve inquiries', error: error.message });
  }
};