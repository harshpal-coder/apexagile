const { Task, Project, User, Comment, Notification } = require('../models');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assigneeId, projectId, sprintId, dueDate, labels } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Please provide task title and project ID' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check SaaS Task limits in workspace
    const workspace = await Workspace.findById(project.workspaceId);
    if (workspace) {
      const ownerUser = await User.findById(workspace.owner);
      const plan = ownerUser.subscription?.plan || 'Free';

      if (plan === 'Free') {
        const projects = await Project.find({ workspaceId: workspace._id });
        let totalWorkspaceTasks = 0;
        for (const p of projects) {
          const c = await Task.countDocuments({ projectId: p._id });
          totalWorkspaceTasks += c;
        }

        if (totalWorkspaceTasks >= 10) {
          return res.status(402).json({
            success: false,
            code: 'LIMIT_EXCEEDED',
            message: 'Task limit reached (max 10 tasks on Free tier). Upgrade to Pro for unlimited tasks!'
          });
        }
      }
    }

    // Generate unique sequential Jira key e.g., DEM-1
    const taskCount = await Task.countDocuments({ projectId });
    const taskKey = `${project.key}-${taskCount + 1}`;

    const task = await Task.create({
      title,
      key: taskKey,
      description: description || '',
      status: status || 'Backlog',
      priority: priority || 'Medium',
      assignee: assigneeId || null,
      creator: req.user._id,
      projectId,
      sprintId: sprintId || null,
      dueDate: dueDate || null,
      completedAt: (status === 'Done') ? new Date() : null,
      labels: labels || [],
      attachments: []
    });

    // Notify assignee if assigned
    if (assigneeId && assigneeId !== req.user._id.toString()) {
      await Notification.create({
        user: assigneeId,
        content: `${req.user.username} assigned you the task: ${taskKey} - ${title}`,
        type: 'Assign',
        projectId,
        taskId: task._id
      });
    }

    return res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks/project/:projectId
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sprintId, assignee, search, status, priority } = req.query;

    const query = { projectId };

    if (sprintId) {
      query.sprintId = sprintId === 'backlog' ? null : sprintId;
    }
    if (assignee) {
      query.assignee = assignee;
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    let tasks = await Task.find(query);

    // Apply search filter manually (in JS to support both MongoDB & JSON DB regex-like behaviors)
    if (search) {
      const searchLower = search.toLowerCase();
      tasks = tasks.filter(
        t =>
          t.title.toLowerCase().includes(searchLower) ||
          t.key.toLowerCase().includes(searchLower) ||
          (t.description || '').toLowerCase().includes(searchLower)
      );
    }

    // Sort tasks: Priority level weight, then date created
    const priorityWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    tasks.sort((a, b) => {
      const weightA = priorityWeights[a.priority] || 2;
      const weightB = priorityWeights[b.priority] || 2;
      if (weightB !== weightA) return weightB - weightA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Populate creator and assignee manually for safety
    const creatorUser = await User.findById(task.creator);
    const assigneeUser = task.assignee ? await User.findById(task.assignee) : null;
    const project = await Project.findById(task.projectId);

    const taskData = {
      ...(task.toObject ? task.toObject() : task),
      creatorDetails: creatorUser
        ? { _id: creatorUser._id, username: creatorUser.username, avatar: creatorUser.avatar }
        : null,
      assigneeDetails: assigneeUser
        ? { _id: assigneeUser._id, username: assigneeUser.username, avatar: assigneeUser.avatar }
        : null,
      projectDetails: project ? { _id: project._id, name: project.name, key: project.key } : null
    };

    return res.json({
      success: true,
      task: taskData
    });
  } catch (error) {
    console.error('Get task details error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Update task details (including DnD status dragging)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assigneeId, sprintId, dueDate, labels } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status) {
      updates.status = status;
      if (status === 'Done') {
        updates.completedAt = new Date();
      } else {
        updates.completedAt = null;
      }
    }
    if (priority) updates.priority = priority;
    if (assigneeId !== undefined) updates.assignee = assigneeId;
    if (sprintId !== undefined) updates.sprintId = sprintId;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (labels) updates.labels = labels;

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });

    // Handle activity notifications
    if (status && status !== task.status) {
      // Notify creator / assignee of status transition
      const notifyUsers = [task.creator];
      if (task.assignee) notifyUsers.push(task.assignee);

      const uniqueNotify = [...new Set(notifyUsers)].filter(id => id.toString() !== req.user._id.toString());

      await Promise.all(
        uniqueNotify.map(async (uId) => {
          await Notification.create({
            user: uId,
            content: `${req.user.username} updated status of ${task.key} to [${status}]`,
            type: 'StatusUpdate',
            projectId: task.projectId,
            taskId: task._id
          });
        })
      );
    }

    if (assigneeId && assigneeId !== (task.assignee ? task.assignee.toString() : '')) {
      if (assigneeId !== req.user._id.toString()) {
        await Notification.create({
          user: assigneeId,
          content: `${req.user.username} assigned you the task: ${task.key} - ${task.title}`,
          type: 'Assign',
          projectId: task.projectId,
          taskId: task._id
        });
      }
    }

    return res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Create a comment
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      taskId: task._id
    });

    // Notify assignee / creator about comment, parsing @mentions
    const notifyUsers = new Set();
    if (task.creator.toString() !== req.user._id.toString()) notifyUsers.add(task.creator.toString());
    if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
      notifyUsers.add(task.assignee.toString());
    }

    // Mention parser e.g. @username
    const mentions = content.match(/@\w+/g);
    if (mentions) {
      await Promise.all(
        mentions.map(async (m) => {
          const uName = m.substring(1);
          const mentionedUser = await User.findOne({ username: uName });
          if (mentionedUser && mentionedUser._id.toString() !== req.user._id.toString()) {
            notifyUsers.add(mentionedUser._id.toString());
            // Create specific mention notification
            await Notification.create({
              user: mentionedUser._id,
              content: `${req.user.username} mentioned you in a comment on ${task.key}`,
              type: 'Mention',
              projectId: task.projectId,
              taskId: task._id
            });
          }
        })
      );
    }

    // Standard comment notifications for others
    await Promise.all(
      Array.from(notifyUsers).map(async (uId) => {
        // Only if they haven't already received a mention
        await Notification.create({
          user: uId,
          content: `${req.user.username} commented on ${task.key}`,
          type: 'Comment',
          projectId: task.projectId,
          taskId: task._id
        });
      })
    );

    return res.status(201).json({
      success: true,
      comment: {
        ...(comment.toObject ? comment.toObject() : comment),
        authorDetails: {
          _id: req.user._id,
          username: req.user.username,
          avatar: req.user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get comments for task
// @route   GET /api/tasks/:id/comments
// @access  Private
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.id });

    // Populate authors manually
    const commentsWithAuthors = await Promise.all(
      comments.map(async (c) => {
        const u = await User.findById(c.author);
        return {
          ...(c.toObject ? c.toObject() : c),
          authorDetails: u
            ? { _id: u._id, username: u.username, avatar: u.avatar }
            : { _id: c.author, username: 'Deleted User', avatar: '' }
        };
      })
    );

    // Sort comments chronologically
    commentsWithAuthors.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return res.json({
      success: true,
      comments: commentsWithAuthors
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Upload mock attachment
// @route   POST /api/tasks/:id/attachments
// @access  Private
exports.addAttachment = async (req, res) => {
  try {
    const { name, size } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Attachment name is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Mock attachment upload and generate dynamic URL
    const attachment = {
      name,
      size: size || Math.floor(Math.random() * 5000000) + 100000,
      url: `https://raw.githubusercontent.com/lucide-react/lucide/main/icons/file.svg`,
      uploadedAt: new Date().toISOString()
    };

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { attachments: attachment } },
      { new: true }
    );

    return res.json({
      success: true,
      task: updated,
      attachment
    });
  } catch (error) {
    console.error('Add attachment error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
