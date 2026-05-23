const express = require('express');
const router = express.Router();
const {
  createSprint,
  getSprints,
  startSprint,
  endSprint,
  getSprintProgress
} = require('../controllers/sprintController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createSprint);
router.get('/project/:projectId', protect, getSprints);
router.put('/:id/start', protect, startSprint);
router.put('/:id/complete', protect, endSprint);
router.get('/:id/progress', protect, getSprintProgress);

module.exports = router;
