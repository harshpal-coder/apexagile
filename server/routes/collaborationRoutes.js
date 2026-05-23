const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  getRecentActivity
} = require('../controllers/collaborationController');
const { protect } = require('../middleware/auth');

router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.get('/activity/:projectId', protect, getRecentActivity);

module.exports = router;
