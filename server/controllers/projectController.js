const { Project, Workspace, User } = require('../models');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const { name, description, workspaceId, key } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({ success: false, message: 'Please provide project name and workspace ID' });
    }

    // Verify workspace exists and user is a member
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // Check key or generate one
    let projectKey = key;
    if (!projectKey) {
      projectKey = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .replace(/[^A-Z0-9]/gi, '')
        .toUpperCase();
      
      if (!projectKey || projectKey.length < 2) {
        projectKey = name.substring(0, 3).toUpperCase();
      }
    }
    projectKey = projectKey.substring(0, 5);

    // Create the project
    const project = await Project.create({
      name,
      key: projectKey,
      description: description || '',
      status: 'Active',
      workspaceId,
      lead: req.user._id,
      members: [req.user._id]
    });

    return res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get all projects in workspace
// @route   GET /api/projects/workspace/:workspaceId
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Return projects that belong to the workspace and where the user is a member
    const projects = await Project.find({ workspaceId });
    
    // Sort or filter if needed, in MDB or custom fallback
    return res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Get details of lead and members (for frontend convenience)
    // Normally we use Mongoose populate, but since we support both real Mongo and fallback,
    // we can do manual fetch if we want absolute reliability, or we can just fetch and augment.
    const leadUser = await User.findById(project.lead);
    const memberUsers = await Promise.all(
      (project.members || []).map(async (mId) => {
        const u = await User.findById(mId);
        return u ? { _id: u._id, username: u.username, email: u.email, avatar: u.avatar } : null;
      })
    );

    const projectData = {
      ...(project.toObject ? project.toObject() : project),
      leadDetails: leadUser ? { _id: leadUser._id, username: leadUser.username, avatar: leadUser.avatar } : null,
      memberDetails: memberUsers.filter(Boolean)
    };

    return res.json({
      success: true,
      project: projectData
    });
  } catch (error) {
    console.error('Get project detail error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;

    const updated = await Project.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.json({
      success: true,
      project: updated
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await Project.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
exports.addProjectMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide user email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const workspace = await Workspace.findById(project.workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // SaaS Seats Check
    if (!(workspace.members || []).includes(user._id.toString())) {
      const ownerUser = await User.findById(workspace.owner);
      const plan = ownerUser.subscription?.plan || 'Free';
      const currentMembersCount = workspace.members ? workspace.members.length : 0;

      if (plan === 'Free' && currentMembersCount >= 3) {
        return res.status(402).json({
          success: false,
          code: 'LIMIT_EXCEEDED',
          message: 'Workspace member capacity reached (max 3 members on Free tier). Upgrade to Pro for up to 15 members, or Enterprise for unlimited!'
        });
      }

      if (plan === 'Pro' && currentMembersCount >= 15) {
        return res.status(402).json({
          success: false,
          code: 'LIMIT_EXCEEDED',
          message: 'Workspace member capacity reached (max 15 members on Pro tier). Upgrade to Enterprise for unlimited members!'
        });
      }
    }

    const projectMembers = project.members || [];
    if (projectMembers.includes(user._id.toString())) {
      return res.status(400).json({ success: false, message: 'User is already a project member' });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { $push: { members: user._id } },
      { new: true }
    );

    // Also add to workspace if not already present
    if (!(workspace.members || []).includes(user._id.toString())) {
      await Workspace.findByIdAndUpdate(project.workspaceId, {
        $push: { members: user._id }
      });
      await User.findByIdAndUpdate(user._id, {
        $push: { workspaces: project.workspaceId }
      });
    }

    return res.json({
      success: true,
      project: updated,
      message: `Successfully added ${user.username} to the project`
    });
  } catch (error) {
    console.error('Add project member error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Create/Get user workspaces
// @route   GET /api/projects/workspaces
// @access  Private
exports.getWorkspaces = async (req, res) => {
  try {
    // Return all workspaces where user is owner or member
    const user = await User.findById(req.user._id);
    const workspaces = await Promise.all(
      (user.workspaces || []).map(async (wsId) => {
        return await Workspace.findById(wsId);
      })
    );

    return res.json({
      success: true,
      workspaces: workspaces.filter(Boolean)
    });
  } catch (error) {
    console.error('Get workspaces error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Create a workspace
// @route   POST /api/projects/workspaces
// @access  Private
exports.createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide workspace name' });
    }

    // SaaS Workspace Limits Check
    const user = await User.findById(req.user._id);
    const plan = user.subscription?.plan || 'Free';
    const ownedCount = await Workspace.countDocuments({ owner: user._id });

    if (plan === 'Free' && ownedCount >= 1) {
      return res.status(402).json({
        success: false,
        code: 'LIMIT_EXCEEDED',
        message: 'Workspace limit reached. You can create only 1 workspace on the Free tier. Upgrade to Pro for up to 5 workspaces, or Enterprise for unlimited!'
      });
    }

    if (plan === 'Pro' && ownedCount >= 5) {
      return res.status(402).json({
        success: false,
        code: 'LIMIT_EXCEEDED',
        message: 'Workspace limit reached. Pro plan allows up to 5 workspaces. Upgrade to Enterprise for unlimited workspaces!'
      });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

    const workspace = await Workspace.create({
      name,
      slug,
      description: description || '',
      owner: req.user._id,
      members: [req.user._id]
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id }
    });

    return res.status(201).json({
      success: true,
      workspace
    });
  } catch (error) {
    console.error('Create workspace error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
