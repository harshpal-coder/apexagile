// Load environment variables immediately on seeder boot
require('dotenv').config();

const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const { User, Workspace, Project, Task, Sprint, Comment, Notification, isMongo, dbEngine } = require('../models');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Reset Database Collections
    if (isMongo) {
      console.log('MongoDB Detected: Dropping previous collections...');
      await User.deleteMany({});
      await Workspace.deleteMany({});
      await Project.deleteMany({});
      await Task.deleteMany({});
      await Sprint.deleteMany({});
      await Comment.deleteMany({});
      await Notification.deleteMany({});
    } else {
      console.log('JSON DB Fallback Detected: Resetting local files...');
      dbEngine.writeDb({
        users: [],
        workspaces: [],
        projects: [],
        tasks: [],
        sprints: [],
        comments: [],
        notifications: []
      });
    }

    // 2. Hash default passwords
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // 3. Create Users
    console.log('Creating users...');
    const admin = await User.create({
      username: 'harsh_admin',
      email: 'admin@agile.com',
      password: defaultPassword,
      role: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=harsh_admin',
      workspaces: []
    });

    const manager = await User.create({
      username: 'sarah_pm',
      email: 'manager@agile.com',
      password: defaultPassword,
      role: 'Manager',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sarah_pm',
      workspaces: []
    });

    const alice = await User.create({
      username: 'alice_dev',
      email: 'alice@agile.com',
      password: defaultPassword,
      role: 'Member',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=alice_dev',
      workspaces: []
    });

    const bob = await User.create({
      username: 'bob_dev',
      email: 'bob@agile.com',
      password: defaultPassword,
      role: 'Member',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=bob_dev',
      workspaces: []
    });

    // 4. Create Workspace
    console.log('Creating workspace...');
    const workspace = await Workspace.create({
      name: 'Apex Agile Space',
      slug: 'apex-agile-space',
      description: 'Primary workspace for software design, frontend development, and core API building.',
      owner: admin._id,
      members: [admin._id, manager._id, alice._id, bob._id]
    });

    // Link users to workspace
    const userIds = [admin._id, manager._id, alice._id, bob._id];
    for (const id of userIds) {
      await User.findByIdAndUpdate(id, { $push: { workspaces: workspace._id } });
    }

    // 5. Create Projects
    console.log('Creating projects...');
    const project1 = await Project.create({
      name: 'Acme Smart SaaS',
      key: 'APEX',
      description: 'Flagship smart task scheduler application powered by next-gen workflow orchestrations.',
      status: 'Active',
      workspaceId: workspace._id,
      lead: manager._id,
      members: [admin._id, manager._id, alice._id, bob._id]
    });

    const project2 = await Project.create({
      name: 'Mobile Delivery App',
      key: 'MOBI',
      description: 'Flutter-based high-performance logistics app for micro-delivery services.',
      status: 'Active',
      workspaceId: workspace._id,
      lead: admin._id,
      members: [admin._id, alice._id]
    });

    // 6. Create Sprints for Project 1 (Acme Smart SaaS)
    console.log('Creating sprints...');
    const now = new Date();
    
    // Sprint 1: Completed
    const sprint1Start = new Date(now);
    sprint1Start.setDate(now.getDate() - 21);
    const sprint1End = new Date(now);
    sprint1End.setDate(now.getDate() - 7);
    
    const sprint1 = await Sprint.create({
      name: 'APEX Sprint 1: Core Foundation',
      goal: 'Setup backend authentication protocols, structure schemas, and configure Vite React layout.',
      status: 'Completed',
      startDate: sprint1Start.toISOString(),
      endDate: sprint1End.toISOString(),
      projectId: project1._id
    });

    // Sprint 2: Active
    const sprint2Start = new Date(now);
    sprint2Start.setDate(now.getDate() - 6);
    const sprint2End = new Date(now);
    sprint2End.setDate(now.getDate() + 8);

    const sprint2 = await Sprint.create({
      name: 'APEX Sprint 2: Collaboration Board',
      goal: 'Implement fully interactive drag-and-drop Kanban Board page and comment section with user mentions.',
      status: 'Active',
      startDate: sprint2Start.toISOString(),
      endDate: sprint2End.toISOString(),
      projectId: project1._id
    });

    // Sprint 3: Planned (Backlog)
    const sprint3 = await Sprint.create({
      name: 'APEX Sprint 3: Platform Analytics',
      goal: 'Build SVG burndown metrics chart and platform administration configuration modules.',
      status: 'Planned',
      projectId: project1._id
    });

    // 7. Create Tasks
    console.log('Creating tasks...');
    
    // --- Sprint 1 Completed Tasks ---
    await Task.create({
      title: 'Initialize Docker Compose and PostgreSQL configuration',
      key: 'APEX-1',
      description: 'Provision Docker volumes and establish robust startup configurations for database containerization.',
      status: 'Done',
      priority: 'High',
      assignee: bob._id,
      creator: manager._id,
      projectId: project1._id,
      sprintId: sprint1._id,
      labels: ['devops', 'backend']
    });

    await Task.create({
      title: 'Configure JWT Auth structures and secure endpoints',
      key: 'APEX-2',
      description: 'Implement token signing, cookie extraction, refresh protocols, and authorization validation middlewares.',
      status: 'Done',
      priority: 'Critical',
      assignee: alice._id,
      creator: manager._id,
      projectId: project1._id,
      sprintId: sprint1._id,
      labels: ['backend', 'security']
    });

    await Task.create({
      title: 'Design high-fidelity SaaS dashboard wireframes',
      key: 'APEX-3',
      description: 'Sketch dark/light grids, collapsible sidebar dimensions, and dashboard stats layout using Figma components.',
      status: 'Done',
      priority: 'Medium',
      assignee: alice._id,
      creator: admin._id,
      projectId: project1._id,
      sprintId: sprint1._id,
      labels: ['design', 'ux']
    });

    // --- Sprint 2 Active Tasks (Kanban Board Columns) ---
    const t4 = await Task.create({
      title: 'Build drag-and-drop column grid using Framer Motion animations',
      key: 'APEX-4',
      description: 'Create responsive grids with dynamic drop indicators. Animate cards seamlessly on state transitions.',
      status: 'In Progress',
      priority: 'Critical',
      assignee: alice._id,
      creator: manager._id,
      projectId: project1._id,
      sprintId: sprint2._id,
      labels: ['frontend', 'animation'],
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
    });

    const t5 = await Task.create({
      title: 'Integrate Comment thread parsing to support @username mentions',
      key: 'APEX-5',
      description: 'Write a regex parser in the text field to match @mentions and trigger real-time notification alerts for targeted workspace users.',
      status: 'Review',
      priority: 'High',
      assignee: bob._id,
      creator: alice._id,
      projectId: project1._id,
      sprintId: sprint2._id,
      labels: ['backend', 'collaboration'],
      dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString()
    });

    const t6 = await Task.create({
      title: 'Fix sidebar overlapping on medium mobile viewport dimensions',
      key: 'APEX-6',
      description: 'Adjust z-index, add screen dimensions listener, and bind hamburger click toggle state to Zustand navigation store.',
      status: 'Todo',
      priority: 'Low',
      assignee: bob._id,
      creator: admin._id,
      projectId: project1._id,
      sprintId: sprint2._id,
      labels: ['frontend', 'bug']
    });

    await Task.create({
      title: 'Implement SVG productivity and burn-down analytics metrics',
      key: 'APEX-7',
      description: 'Compute progress ratios, map coordinates dynamically on responsive viewboxes, and draw smooth grid paths.',
      status: 'Done',
      priority: 'Medium',
      assignee: alice._id,
      creator: manager._id,
      projectId: project1._id,
      sprintId: sprint2._id,
      labels: ['frontend', 'analytics']
    });

    // --- Backlog (Planned Sprint / No Sprint Tasks) ---
    await Task.create({
      title: 'Incorporate OAuth2 login via GitHub & Google services',
      key: 'APEX-8',
      description: 'Register applications in OAuth providers and write authorization code exchanges on the Express backend routers.',
      status: 'Backlog',
      priority: 'Medium',
      assignee: null,
      creator: manager._id,
      projectId: project1._id,
      sprintId: null,
      labels: ['auth', 'backend']
    });

    await Task.create({
      title: 'Draft extensive REST API endpoints markdown documentation',
      key: 'APEX-9',
      description: 'Write README specs detailing request body payloads, response formats, auth requirements, and query parameter parameters.',
      status: 'Backlog',
      priority: 'Low',
      assignee: null,
      creator: bob._id,
      projectId: project1._id,
      sprintId: sprint3._id, // Planned sprint
      labels: ['docs']
    });

    // 8. Create Comments on Active Tasks
    console.log('Seeding conversation comments...');
    await Comment.create({
      content: "I've started the drag-and-drop animation engine using standard HTML5 DnD event binders. Alice, can you review the card motion?",
      author: bob._id,
      taskId: t4._id
    });

    await Comment.create({
      content: "Yes @bob_dev, will look into it tonight. Make sure the CSS `cursor` changes to `grabbing` during active clicks!",
      author: alice._id,
      taskId: t4._id
    });

    await Comment.create({
      content: "The @username regex matches are functioning perfectly. Alice, can you test the notification popup badge?",
      author: bob._id,
      taskId: t5._id
    });

    // 9. Seed some Notifications
    console.log('Seeding user notifications...');
    await Notification.create({
      user: alice._id,
      content: 'bob_dev mentioned you in a comment on APEX-4',
      type: 'Mention',
      read: false,
      projectId: project1._id,
      taskId: t4._id
    });

    await Notification.create({
      user: bob._id,
      content: 'alice_dev assigned you the task: APEX-5 - Parse @username mentions',
      type: 'Assign',
      read: true,
      projectId: project1._id,
      taskId: t5._id
    });

    await Notification.create({
      user: admin._id,
      content: 'sarah_pm started Sprint: APEX Sprint 2: Collaboration Board',
      type: 'SprintStart',
      read: false,
      projectId: project1._id
    });

    console.log('✅ Seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('✖ Database Seeding Failed:', error);
    throw error;
  }
};

// Execute if run directly
if (require.main === module) {
  const run = async () => {
    // Dynamically load env
    require('dotenv').config();
    const isOffline = !process.env.MONGODB_URI;
    
    if (!isOffline) {
      await connectDB();
    }
    
    await seedData();
    if (!isOffline) {
      process.exit(0);
    }
  };
  run();
}

module.exports = seedData;
