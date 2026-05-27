const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: true
};
app.use(cors(corsOptions));
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
app.use('/api/billing', require('./routes/billingRoutes'));

const path = require('path');
const fs = require('fs');

// Server status ping
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    databaseMode: process.env.MONGODB_URI ? 'MongoDB (Cloud/Local)' : 'Local JSON Fallback DB'
  });
});

// Serve compiled React frontend assets in production if they exist
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '..', 'client', 'dist');
  
  if (fs.existsSync(staticPath)) {
    // Set static folder
    app.use(express.static(staticPath));

    // Redirect all non-API GET requests to index.html (client-side routing)
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        const indexPath = path.join(staticPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('Not Found');
        }
      }
    });
  } else {
    // Fallback welcome message for separate backend deployment
    app.get('/', (req, res) => {
      res.json({
        message: 'Welcome to the ApexAgile API Service',
        status: 'online',
        timestamp: new Date().toISOString(),
        databaseMode: process.env.MONGODB_URI ? 'MongoDB (Cloud/Local)' : 'Local JSON Fallback DB'
      });
    });
  }
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
