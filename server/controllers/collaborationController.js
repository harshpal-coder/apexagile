const { Notification, Task, Comment, Sprint, Project, User } = require('../models');

// @desc    Get user notifications
// @route   GET /api/collaboration/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id });
    
    // Sort notifications: unread first, then chronologically descending
    notifications.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/collaboration/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.json({
      success: true,
      notification: updated
    });
  } catch (error) {
    console.error('Read notification error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get recent activity stream for dashboard
// @route   GET /api/collaboration/activity/:projectId
// @access  Private
exports.getRecentActivity = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Collect recent Tasks, Comments, Sprints in the project to dynamically compile a activity timeline
    const tasks = await Task.find({ projectId });
    const comments = await Comment.find({}); // Fetch and filter manually to ensure compatibility with local JSON engine
    const sprints = await Sprint.find({ projectId });

    const activities = [];

    // 1. Task activities
    await Promise.all(
      tasks.map(async (task) => {
        const creator = await User.findById(task.creator);
        activities.push({
          _id: `task-${task._id}`,
          type: 'task',
          action: 'created',
          text: `created the issue ${task.key}: "${task.title}"`,
          user: creator ? { username: creator.username, avatar: creator.avatar } : { username: 'System' },
          timestamp: task.createdAt,
          badge: task.priority
        });

        if (task.updatedAt !== task.createdAt) {
          activities.push({
            _id: `task-up-${task._id}-${task.updatedAt}`,
            type: 'task',
            action: 'updated',
            text: `updated the issue ${task.key}: "${task.title}" [${task.status}]`,
            user: creator ? { username: creator.username, avatar: creator.avatar } : { username: 'System' },
            timestamp: task.updatedAt,
            badge: task.status
          });
        }
      })
    );

    // 2. Comments activities
    const taskIds = tasks.map(t => t._id.toString());
    const projectComments = comments.filter(c => taskIds.includes(c.taskId.toString()));

    await Promise.all(
      projectComments.map(async (comment) => {
        const author = await User.findById(comment.author);
        const task = tasks.find(t => t._id.toString() === comment.taskId.toString());
        if (task) {
          activities.push({
            _id: `comment-${comment._id}`,
            type: 'comment',
            action: 'added',
            text: `commented on ${task.key}: "${comment.content.substring(0, 60)}${comment.content.length > 60 ? '...' : ''}"`,
            user: author ? { username: author.username, avatar: author.avatar } : { username: 'Anonymous' },
            timestamp: comment.createdAt
          });
        }
      })
    );

    // 3. Sprints activities
    await Promise.all(
      sprints.map(async (sprint) => {
        activities.push({
          _id: `sprint-${sprint._id}-${sprint.createdAt}`,
          type: 'sprint',
          action: 'created',
          text: `planned a new Sprint: "${sprint.name}"`,
          user: { username: 'Product Lead', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sprint' },
          timestamp: sprint.createdAt
        });

        if (sprint.status === 'Active') {
          activities.push({
            _id: `sprint-act-${sprint._id}`,
            type: 'sprint',
            action: 'started',
            text: `started Sprint: "${sprint.name}"`,
            user: { username: 'Product Lead', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sprint' },
            timestamp: sprint.startDate || sprint.updatedAt
          });
        } else if (sprint.status === 'Completed') {
          activities.push({
            _id: `sprint-comp-${sprint._id}`,
            type: 'sprint',
            action: 'completed',
            text: `completed Sprint: "${sprint.name}"`,
            user: { username: 'Product Lead', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sprint' },
            timestamp: sprint.updatedAt
          });
        }
      })
    );

    // Sort all activities chronologically (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit to top 20
    const recentActivities = activities.slice(0, 20);

    return res.json({
      success: true,
      activities: recentActivities
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
