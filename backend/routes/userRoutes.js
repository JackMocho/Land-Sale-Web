// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Import Middleware
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), userController.getAllUsers);

/**
 * @desc    Get logged-in user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
router.get('/profile', protect, userController.getMyProfile);

/**
 * @desc    Update logged-in user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
router.put('/profile', protect, userController.updateMyProfile);

/**
 * @desc    Get user by ID (Admin or Self)
 * @route   GET /api/users/:id
 * @access  Private
 */
router.get('/:id', protect, userController.getUserById);

/**
 * @desc    Update user (Admin or Self)
 * @route   PUT /api/users/:id
 * @access  Private
 */
router.put('/:id', protect, userController.updateUser);

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

/**
 * @desc    Approve user (Admin only)
 * @route   PUT /api/users/:id/approve
 * @access  Private/Admin
 */
router.put('/:id/approve', protect, authorize('admin'), userController.approveUser);

/**
 * @desc    Suspend user (Admin only)
 * @route   PUT /api/users/:id/suspend
 * @access  Private/Admin
 */
router.put('/:id/suspend', protect, authorize('admin'), userController.suspendUser);

module.exports = router;