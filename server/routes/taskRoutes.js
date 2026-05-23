const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  getComments,
  addAttachment
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createTask);
router.get('/project/:projectId', protect, getTasks);
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

// Comments
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', protect, getComments);

// Attachments
router.post('/:id/attachments', protect, addAttachment);

module.exports = router;
