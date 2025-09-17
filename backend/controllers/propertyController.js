// controllers/propertyController.js
const pool = require('../config/pg');

// Get all properties (with optional filters)
exports.getProperties = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM "Property" WHERE "isapproved" = TRUE');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM "Property" WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Property not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

// Create property
exports.createProperty = async (req, res) => {
  try {
    const {
      sellerId, title, description, price, size, sizeUnit, type,
      county, constituency, location, coordinates, images, documents, boundary
    } = req.body;

    // Validation: check required fields
    if (
      !sellerId || !title || !description || !price || !size || !sizeUnit ||
      !type || !county || !constituency || !location || !coordinates
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Ensure images/documents are arrays, boundary is object or null
    const imagesData = Array.isArray(images) ? images : [];
    const documentsData = Array.isArray(documents) ? documents : [];
    const boundaryData = boundary ? boundary : null;

    // Defensive: ensure images/documents are arrays of strings (URLs)
    if (!Array.isArray(imagesData) || !Array.isArray(documentsData)) {
      return res.status(400).json({ error: 'Images and documents must be arrays.' });
    }

    // Log payload for debugging
    console.log('Create property payload:', {
      sellerId, title, description, price, size, sizeUnit, type,
      county, constituency, location, coordinates, imagesData, documentsData, boundaryData
    });

    const { rows } = await pool.query(
      `INSERT INTO "Property"
        (sellerId, title, description, price, size, sizeUnit, type, county, constituency, location, coordinates, images, documents, boundary, isapproved)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING *`,
      [
        sellerId, title, description, price, size, sizeUnit, type,
        county, constituency, location, coordinates,
        imagesData, documentsData, boundaryData, false
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create property error:', err);
    res.status(500).json({ error: 'Failed to create property' });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((f, i) => `"${f}" = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE "Property" SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Property not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update property' });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM "Property" WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Property not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
};

// Approve property
exports.approveProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'UPDATE "Property" SET "isapproved" = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Property not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve property' });
  }
};