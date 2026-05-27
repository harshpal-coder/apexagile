const { Workspace, Project, Task, User } = require('../models');

// @desc    Get user's SaaS billing usage metrics
// @route   GET /api/billing/usage
// @access  Private
exports.getBillingUsage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Calculate workspaces count (owned by user)
    const workspacesCount = await Workspace.countDocuments({ owner: user._id });

    // 2. Active workspace members & tasks count
    let activeWorkspaceId = req.query.workspaceId;
    let membersCount = 0;
    let tasksCount = 0;
    let activeWorkspaceName = 'None';

    if (!activeWorkspaceId && user.workspaces && user.workspaces.length > 0) {
      activeWorkspaceId = user.workspaces[0];
    }

    if (activeWorkspaceId) {
      const workspace = await Workspace.findById(activeWorkspaceId);
      if (workspace) {
        activeWorkspaceName = workspace.name;
        membersCount = workspace.members ? workspace.members.length : 0;

        // Fetch all projects in this workspace
        const projects = await Project.find({ workspaceId: workspace._id });
        const projectIds = projects.map(p => p._id);

        // Count tasks in all projects
        for (const pId of projectIds) {
          const c = await Task.countDocuments({ projectId: pId });
          tasksCount += c;
        }
      }
    }

    // 3. Subscription limits mapping
    const plan = user.subscription?.plan || 'Free';
    const planLimits = {
      Free: { workspaces: 1, members: 3, tasks: 10 },
      Pro: { workspaces: 5, members: 15, tasks: Infinity },
      Enterprise: { workspaces: Infinity, members: Infinity, tasks: Infinity }
    };

    const currentLimits = planLimits[plan] || planLimits.Free;

    return res.json({
      success: true,
      subscription: user.subscription || { plan: 'Free', status: 'Active' },
      usage: {
        workspaces: {
          current: workspacesCount,
          limit: currentLimits.workspaces,
          percentage: currentLimits.workspaces === Infinity ? 0 : Math.min(100, Math.round((workspacesCount / currentLimits.workspaces) * 100))
        },
        members: {
          activeWorkspaceName,
          current: membersCount,
          limit: currentLimits.members,
          percentage: currentLimits.members === Infinity ? 0 : Math.min(100, Math.round((membersCount / currentLimits.members) * 100))
        },
        tasks: {
          current: tasksCount,
          limit: currentLimits.tasks,
          percentage: currentLimits.tasks === Infinity ? 0 : Math.min(100, Math.round((tasksCount / currentLimits.tasks) * 100))
        }
      }
    });
  } catch (error) {
    console.error('Get billing usage error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Simulate and complete credit card upgrade (Mock Stripe Checkout)
// @route   POST /api/billing/upgrade
// @access  Private
exports.upgradeSubscription = async (req, res) => {
  try {
    const { plan, paymentCard, customerName } = req.body;
    if (!plan || !['Free', 'Pro', 'Enterprise'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing plan type' });
    }

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30); // 30-day billing cycle

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscription: {
          plan,
          status: 'Active',
          currentPeriodEnd: currentPeriodEnd.toISOString(),
          paymentCard: paymentCard || '4242',
          customerName: customerName || req.user.username
        }
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: `Successfully upgraded to ${plan} tier!`,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        workspaces: updatedUser.workspaces || [],
        subscription: updatedUser.subscription
      }
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Simulate cancellation of active plan
// @route   POST /api/billing/cancel
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        'subscription.status': 'Canceled'
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: 'Subscription canceled successfully. Access will revert to Free tier at current billing cycle end.',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        workspaces: updatedUser.workspaces || [],
        subscription: updatedUser.subscription
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
