// routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import Middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Import Controller
const propertyController = require('../controllers/propertyController');

// Configure multer for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    // Use Date.now for unique file names
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

/**
 * @desc    Get all approved properties (Public)
 * @route   GET /api/properties
 * @access  Public
 */
router.get('/', propertyController.getProperties);

/**
 * @desc    Get property by ID
 * @route   GET /api/properties/:id
 * @access  Public
 */
router.get('/:id', propertyController.getPropertyById);

/**
 * @desc    Create a new property listing
 * @route   POST /api/properties
 * @access  Private (seller only)
 */
router.post('/', protect, authorize('seller', 'admin'), propertyController.createProperty);

/**
 * @desc    Update property listing (owner or admin)
 * @route   PUT /api/properties/:id
 * @access  Private
 */
router.put('/:id', protect, propertyController.updateProperty);

/**
 * @desc    Delete property listing (owner or admin)
 * @route   DELETE /api/properties/:id
 * @access  Private
 */
router.delete('/:id', protect, propertyController.deleteProperty);

/**
 * @desc    Get logged-in user's property listings
 * @route   GET /api/properties/my-listings
 * @access  Private
 */
router.get('/my-listings', protect, propertyController.getMyListings);

/**
 * @desc    Admin: Approve a property listing
 * @route   PUT /api/properties/:id/approve
 * @access  Private/Admin
 */
router.put('/:id/approve', protect, authorize('admin'), propertyController.approveProperty);

/**
 * @desc    Upload an image
 * @route   POST /api/properties/upload-image
 * @access  Private
 */
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

/**
 * @desc    Upload a document
 * @route   POST /api/properties/upload-document
 * @access  Private
 */
router.post('/upload-document', upload.single('document'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;