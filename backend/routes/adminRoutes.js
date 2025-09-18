// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getStats, getPendingProperties } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { approveProperty } = require('../controllers/propertyController'); // Add this line

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/properties/pending', protect, authorize('admin'), getPendingProperties);
// Add approve route for admin (if not already present)
router.put('/properties/:id/approve', protect, authorize('admin'), approveProperty);

module.exports = router;