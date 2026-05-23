const { Sprint, Task, Project, Notification, User } = require('../models');

// @desc    Create a new planned sprint
// @route   POST /api/sprints
// @access  Private
exports.createSprint = async (req, res) => {
  try {
    const { name, goal, projectId } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({ success: false, message: 'Please provide sprint name and project ID' });
    }

    const sprint = await Sprint.create({
      name,
      goal: goal || '',
      status: 'Planned',
      projectId
    });

    return res.status(201).json({
      success: true,
      sprint
    });
  } catch (error) {
    console.error('Create sprint error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get all sprints in project
// @route   GET /api/sprints/project/:projectId
// @access  Private
exports.getSprints = async (req, res) => {
  try {
    const { projectId } = req.params;
    const sprints = await Sprint.find({ projectId });

    return res.json({
      success: true,
      sprints
    });
  } catch (error) {
    console.error('Get sprints error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Start planned sprint
// @route   PUT /api/sprints/:id/start
// @access  Private
exports.startSprint = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide start and end dates' });
    }

    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    // Ensure no other sprint in this project is active
    const activeSprint = await Sprint.findOne({ projectId: sprint.projectId, status: 'Active' });
    if (activeSprint) {
      return res.status(400).json({ 
        success: false, 
        message: `Another sprint "${activeSprint.name}" is already active. Please complete it first.` 
      });
    }

    const updated = await Sprint.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Active',
        startDate,
        endDate
      },
      { new: true }
    );

    // Notify project members
    const project = await Project.findById(sprint.projectId);
    if (project && project.members) {
      await Promise.all(
        project.members
          .filter(mId => mId.toString() !== req.user._id.toString())
          .map(async (mId) => {
            await Notification.create({
              user: mId,
              content: `${req.user.username} started Sprint: ${sprint.name}`,
              type: 'SprintStart',
              projectId: sprint.projectId
            });
          })
      );
    }

    return res.json({
      success: true,
      sprint: updated
    });
  } catch (error) {
    console.error('Start sprint error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Complete active sprint (Rollover uncompleted tasks)
// @route   PUT /api/sprints/:id/complete
// @access  Private
exports.endSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    if (sprint.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Sprint is not currently active' });
    }

    // Complete the sprint status
    const completedSprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed' },
      { new: true }
    );

    // Roll over incomplete tasks back to backlog (sprintId = null)
    const sprintTasks = await Task.find({ sprintId: req.params.id });
    const incompleteTasks = sprintTasks.filter(task => task.status !== 'Done');
    
    await Promise.all(
      incompleteTasks.map(async (task) => {
        await Task.findByIdAndUpdate(task._id, { sprintId: null });
      })
    );

    return res.json({
      success: true,
      sprint: completedSprint,
      rolledOverCount: incompleteTasks.length,
      message: `Sprint completed successfully. ${incompleteTasks.length} incomplete tasks rolled back to the backlog.`
    });
  } catch (error) {
    console.error('Complete sprint error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get sprint statistics / progress metrics
// @route   GET /api/sprints/:id/progress
// @access  Private
exports.getSprintProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const sprint = await Sprint.findById(id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    const tasks = await Task.find({ sprintId: id });
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const review = tasks.filter(t => t.status === 'Review').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const todo = tasks.filter(t => t.status === 'Todo').length;
    const backlog = tasks.filter(t => t.status === 'Backlog').length;

    return res.json({
      success: true,
      stats: {
        total,
        completed,
        review,
        inProgress,
        todo,
        backlog,
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get sprint progress error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
