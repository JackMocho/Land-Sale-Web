// routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

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
router.post('/', propertyController.createProperty);

/**
 * @desc    Update property listing (owner or admin)
 * @route   PUT /api/properties/:id
 * @access  Private
 */
router.put('/:id', propertyController.updateProperty);

/**
 * @desc    Delete property listing (owner or admin)
 * @route   DELETE /api/properties/:id
 * @access  Private
 */
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;