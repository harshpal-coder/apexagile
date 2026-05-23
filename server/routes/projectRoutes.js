const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  getWorkspaces,
  createWorkspace
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// Workspaces
router.get('/workspaces', protect, getWorkspaces);
router.post('/workspaces', protect, createWorkspace);

// Projects
router.post('/', protect, createProject);
router.get('/workspace/:workspaceId', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/members', protect, addProjectMember);

module.exports = router;
