// routes/inquiryRoutes.js
const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @desc    Create an inquiry for a property
 * @route   POST /api/inquiries
 * @access  Private (buyer or seller)
 */
router.post('/', protect, inquiryController.createInquiry);

/**
 * @desc    Get all inquiries for a property (owner only)
 * @route   GET /api/inquiries/property/:propertyId
 * @access  Private
 */
router.get('/property/:propertyId', protect, inquiryController.getInquiriesByProperty);

/**
 * @desc    Get all inquiries made by logged-in user
 * @route   GET /api/inquiries/my-inquiries
 * @access  Private
 */
router.get('/my-inquiries', protect, inquiryController.getMyInquiries);

// Public routes
router.get('/', inquiryController.getInquiries);
router.get('/:id', inquiryController.getInquiryById);
router.put('/:id', inquiryController.updateInquiry);
router.delete('/:id', inquiryController.deleteInquiry);

module.exports = router;

// controllers/inquiryController.js
exports.getInquiriesByProperty = async (req, res) => {
  // ...implementation...
};
exports.getMyInquiries = async (req, res) => {
  // ...implementation...
};