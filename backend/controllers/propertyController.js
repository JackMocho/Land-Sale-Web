// controllers/propertyController.js
const pool = require('../config/db');
const turf = require('@turf/turf');
const supabase = require('../config/supabase');

// @desc    Get all approved properties with filters
// @route   GET /api/properties
// @access  Public
exports.getAllProperties = async (req, res) => {
  const {
    county,
    constituency,
    minPrice,
    maxPrice,
    minSize,
    maxSize,
    type,
    search
  } = req.query;

  try {
    let query = `SELECT p.*, u.name as owner_name, u.phone as owner_phone
                 FROM "Property" p
                 LEFT JOIN "User" u ON p."ownerId" = u.id
                 WHERE p."isApproved" = true`;
    const params = [];
    let idx = 1;

    if (county) {
      query += ` AND p.county = $${idx++}`;
      params.push(county);
    }
    if (constituency) {
      query += ` AND p.constituency = $${idx++}`;
      params.push(constituency);
    }
    if (minPrice) {
      query += ` AND p.price >= $${idx++}`;
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      query += ` AND p.price <= $${idx++}`;
      params.push(parseFloat(maxPrice));
    }
    if (minSize) {
      query += ` AND p.size >= $${idx++}`;
      params.push(parseFloat(minSize));
    }
    if (maxSize) {
      query += ` AND p.size <= $${idx++}`;
      params.push(parseFloat(maxSize));
    }
    if (type) {
      query += ` AND p.type = $${idx++}`;
      params.push(type);
    }
    if (search) {
      query += ` AND (p.title ILIKE $${idx} OR p.description ILIKE $${idx} OR p.location ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    query += ` ORDER BY p."createdAt" DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get property by ID
// @route   GET /api/properties/:id
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    // Join with User to get phone
    const result = await pool.query(
      `SELECT p.*, u.phone as owner_phone, u.name as owner_name
       FROM "Property" p
       LEFT JOIN "User" u ON p."ownerId" = u.id
       WHERE p.id = $1`, [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const property = result.rows[0];

    // Safely parse images/documents fields
    try {
      property.images = property.images && typeof property.images === 'string'
        ? JSON.parse(property.images)
        : Array.isArray(property.images) ? property.images : [];
    } catch {
      property.images = [];
    }
    try {
      property.documents = property.documents && typeof property.documents === 'string'
        ? JSON.parse(property.documents)
        : Array.isArray(property.documents) ? property.documents : [];
    } catch {
      property.documents = [];
    }

    res.json(property);
  } catch (err) {
    console.error('Get property error:', err); // See error in terminal
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

// @desc    Create new property listing
// @route   POST /api/properties
// @access  Private (seller or admin)
exports.createProperty = async (req, res) => {
  try {
    const {
      title, description, price, size, type, county, constituency, location,
      coordinates, images, documents, boundary, sellerId
    } = req.body;

    // images/documents should be arrays of base64 strings
    const imagesArray = Array.isArray(images) ? images : [];
    const documentsArray = Array.isArray(documents) ? documents : [];

    const result = await pool.query(
      `INSERT INTO "Property"
        (title, description, price, size, type, county, constituency, location, coordinates, images, documents, boundary, sellerId)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING *`,
      [
        title, description, price, size, type, county, constituency, location,
        coordinates,
        JSON.stringify(imagesArray),
        JSON.stringify(documentsArray),
        boundary ? JSON.stringify(boundary) : null,
        sellerId
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Property creation error:', err);
    res.status(500).json({ error: 'Failed to create property' });
  }
};

// @desc    Update property listing
// @route   PUT /api/properties/:id
// @access  Private (owner or admin)
exports.updateProperty = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // Check ownership or admin
    const { rows } = await pool.query('SELECT * FROM "Property" WHERE id = $1', [id]);
    const property = rows[0];
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Build update query dynamically
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of [
      'title', 'description', 'price', 'size', 'sizeUnit', 'type', 'county', 'constituency', 'location', 'coordinates', 'images', 'documents', 'boundary'
    ]) {
      if (req.body[key] !== undefined) {
        if (key === 'images') {
          // Ensure images is stored as JSON string (array of base64)
          fields.push(`${key} = $${idx++}`);
          values.push(JSON.stringify(Array.isArray(req.body[key]) ? req.body[key] : []));
        } else if (key === 'documents') {
          // Ensure documents is stored as JSON string (array of base64)
          fields.push(`${key} = $${idx++}`);
          values.push(JSON.stringify(Array.isArray(req.body[key]) ? req.body[key] : []));
        } else if (key === 'boundary') {
          fields.push(`${key} = $${idx++}`);
          values.push(req.body[key] ? JSON.stringify(req.body[key]) : null);
        } else {
          fields.push(`${key} = $${idx++}`);
          values.push(req.body[key]);
        }
      }
    }
    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    fields.push(`"updatedAt" = NOW()`);
    const updateQuery = `UPDATE "Property" SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    values.push(id);

    const updateResult = await pool.query(updateQuery, values);
    res.json(updateResult.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// @desc    Delete property listing
// @route   DELETE /api/properties/:id
// @access  Private (owner or admin)
exports.deleteProperty = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const { rows } = await pool.query('SELECT * FROM "Property" WHERE id = $1', [id]);
    const property = rows[0];
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await pool.query('DELETE FROM "Property" WHERE id = $1', [id]);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

// @desc    Get logged-in user's listings
// @route   GET /api/properties/my-listings
// @access  Private
exports.getMyListings = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM "Property" WHERE "ownerId" = $1 ORDER BY "createdAt" DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin: Approve a property
// @route   PUT /api/properties/:id/approve
// @access  Private/Admin
exports.approveProperty = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const { rows } = await pool.query(
      'UPDATE "Property" SET "isApproved" = true, "updatedAt" = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Property not found' });
    }
    // TODO: Send email/SMS notification to seller
    res.json({ message: 'Property approved', property: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Approval failed', error: error.message });
  }
};

// @desc    Get properties (admin or public with filters)
// @route   GET /api/properties
// @access  Public or Private (admin)
exports.getProperties = async (req, res) => {
  try {
    let query = supabase.from('Property').select('*');
    if (req.query.isApproved) {
      query = query.eq('isApproved', req.query.isApproved === 'true');
    }
    // Add more filters as needed...

    const { data, error } = await query;
    if (error) throw error;

    // Parse images/documents for each property
    const properties = (data || []).map(row => {
      try {
        row.images = row.images && typeof row.images === 'string'
          ? JSON.parse(row.images)
          : Array.isArray(row.images) ? row.images : [];
      } catch {
        row.images = [];
      }
      try {
        row.documents = row.documents && typeof row.documents === 'string'
          ? JSON.parse(row.documents)
          : Array.isArray(row.documents) ? row.documents : [];
      } catch {
        row.documents = [];
      }
      return row;
    });

    res.json(properties);
  } catch (err) {
    console.error('getProperties error:', err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};