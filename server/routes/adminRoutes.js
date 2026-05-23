const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, getSystemAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Require Admin role for updates/users, and at least Manager/Admin for general analytics
router.get('/users', protect, authorize('Admin', 'Manager'), getAllUsers);
router.put('/users/:id/role', protect, authorize('Admin'), updateUserRole);
router.get('/analytics', protect, authorize('Admin', 'Manager'), getSystemAnalytics);

module.exports = router;
