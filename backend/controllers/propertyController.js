// controllers/propertyController.js
const pool = require('../config/pg');
const { uploadDocument } = require('../utils/cloudinary');

// Get all properties (admin can see all, others only approved)
exports.getProperties = async (req, res) => {
  try {
    let query = `
      SELECT p.*, u.name as seller_name, u.phone as seller_phone
      FROM "Property" p
      LEFT JOIN "User" u ON p."sellerid" = u.id
    `;
    const params = [];
    // Filter by sellerid if provided
    if (req.query.sellerid) {
      query += ' WHERE p."sellerid" = $1';
      params.push(req.query.sellerid);
    } else if (req.query.isApproved === 'TRUE') {
      query += ' WHERE p."isApproved" = TRUE AND p."isapproved" = TRUE';
    }
    const { rows } = await pool.query(query, params);

    // Parse documents for each property
    rows.forEach(property => {
      if (typeof property.documents === 'string') {
        try {
          property.documents = JSON.parse(property.documents);
        } catch {
          property.documents = [];
        }
      }
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

// Get property by ID (include seller info)
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT p.*, u.name as seller_name, u.phone as seller_phone
       FROM "Property" p
       LEFT JOIN "User" u ON p."sellerid" = u.id
       WHERE p.id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Property not found' });

    const property = rows[0];
    if (typeof property.documents === 'string') {
      try {
        property.documents = JSON.parse(property.documents);
      } catch {
        property.documents = [];
      }
    }

    res.json(property);
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

    // Defensive: ensure images/documents are arrays
    const imagesData = Array.isArray(images) ? images : [];
    const documentsData = Array.isArray(documents) ? documents : [];

    // Improved boundary handling
    let boundaryData = null;
    if (boundary) {
      if (typeof boundary === 'string') {
        try {
          boundaryData = JSON.parse(boundary);
        } catch {
          boundaryData = null;
        }
      } else if (typeof boundary === 'object') {
        boundaryData = boundary;
      }
    }
    // Explicitly set to null if undefined or empty
    if (!boundary) {
      boundaryData = null;
    }

    // Upload documents and get URLs
    let documentUrls = [];
    if (Array.isArray(documents)) {
      for (const doc of documents) {
        // doc should be a file path or buffer
        const result = await uploadDocument(doc);
        documentUrls.push({ url: result.secure_url });
      }
    }

    // Log for debugging
    console.log('Create property payload:', {
      sellerId, title, description, price, size, sizeUnit, type,
      county, constituency, location, coordinates, imagesData, documentsData, boundaryData
    });

    const { rows } = await pool.query(
      `INSERT INTO "Property"
        (sellerId, title, description, price, size, sizeUnit, type, county, constituency, location, coordinates, images, documents, boundary, isApproved)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING *`,
      [
        sellerId, title, description, price, size, sizeUnit, type,
        county, constituency, location, coordinates,
        JSON.stringify(imagesData), // <-- stringify here
        JSON.stringify(documentUrls), // <-- and here
        boundaryData ? JSON.stringify(boundaryData) : null, // <-- and here if not null
        false
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create property error:', err);
    res.status(500).json({ error: err.message || 'Failed to create property' });
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
    // Update BOTH isApproved and isapproved to true
    const { rows } = await pool.query(
      `UPDATE "Property"
       SET "isApproved" = TRUE, "isapproved" = TRUE
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve property' });
  }
};