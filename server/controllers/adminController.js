const { User, Workspace, Project, Task } = require('../models');

// @desc    Get all registered users (Admin/Manager only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    
    // Format list securely
    const formatted = users.map(u => ({
      _id: u._id,
      username: u.username,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      createdAt: u.createdAt
    }));

    return res.json({
      success: true,
      users: formatted
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Manager', 'Member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role selection' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });

    return res.json({
      success: true,
      message: `User role updated successfully to ${role}`,
      user: {
        _id: updated._id,
        username: updated.username,
        email: updated.email,
        role: updated.role
      }
    });
  } catch (error) {
    console.error('Admin update user role error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get platform-wide dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getSystemAnalytics = async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    const projectCount = await Project.countDocuments({});
    const workspaceCount = await Workspace.countDocuments({});
    const tasks = await Task.find({});
    
    const taskCount = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const activeTasks = tasks.filter(t => t.status !== 'Done' && t.status !== 'Backlog').length;
    const backlogTasks = tasks.filter(t => t.status === 'Backlog').length;

    // Priorities
    const criticalCount = tasks.filter(t => t.priority === 'Critical').length;
    const highCount = tasks.filter(t => t.priority === 'High').length;
    const mediumCount = tasks.filter(t => t.priority === 'Medium').length;
    const lowCount = tasks.filter(t => t.priority === 'Low').length;

    return res.json({
      success: true,
      analytics: {
        counters: {
          users: userCount,
          projects: projectCount,
          workspaces: workspaceCount,
          tasks: taskCount
        },
        taskCompletionRate: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0,
        taskStatusBreakdown: {
          backlog: backlogTasks,
          active: activeTasks,
          completed: completedTasks
        },
        taskPriorityBreakdown: {
          Critical: criticalCount,
          High: highCount,
          Medium: mediumCount,
          Low: lowCount
        }
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
