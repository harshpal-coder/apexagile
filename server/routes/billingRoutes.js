const express = require('express');
const router = express.Router();
const { getBillingUsage, upgradeSubscription, cancelSubscription } = require('../controllers/billingController');
const { protect } = require('../middleware/auth');

router.get('/usage', protect, getBillingUsage);
router.post('/upgrade', protect, upgradeSubscription);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
