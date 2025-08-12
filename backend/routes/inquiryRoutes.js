// routes/inquiryRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInquiry, getInquiriesByProperty, getMyInquiries } = require('../controllers/inquiryController');

/**
 * @desc    Create an inquiry for a property
 * @route   POST /api/inquiries
 * @access  Private (buyer or seller)
 */
router.post('/', protect, createInquiry);

/**
 * @desc    Get all inquiries for a property (owner only)
 * @route   GET /api/inquiries/property/:propertyId
 * @access  Private
 */
router.get('/property/:propertyId', protect, getInquiriesByProperty);

/**
 * @desc    Get all inquiries made by logged-in user
 * @route   GET /api/inquiries/my-inquiries
 * @access  Private
 */
router.get('/my-inquiries', protect, getMyInquiries);

module.exports = router;