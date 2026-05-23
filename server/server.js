const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Database connection (will auto-fallback to local JSON DB if MONGODB_URI is not provided)
connectDB();

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/sprints', require('./routes/sprintRoutes'));
app.use('/api/collaboration', require('./routes/collaborationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const path = require('path');

// Server status ping
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    databaseMode: process.env.MONGODB_URI ? 'MongoDB (Cloud/Local)' : 'Local JSON Fallback DB'
  });
});

// Serve compiled React frontend assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

  // Redirect all non-API GET requests to index.html (client-side routing)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
    }
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\x1b[35m%s\x1b[0m`, `🚀 Atlassian Jira-Inspired Express Server running on port ${PORT}`);
  console.log(`\x1b[36m%s\x1b[0m`, `👉 API Healthcheck: http://localhost:${PORT}/api/ping`);
});
