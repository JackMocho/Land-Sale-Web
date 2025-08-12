// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getStats, getPendingProperties } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/properties/pending', protect, authorize('admin'), getPendingProperties);

module.exports = router;