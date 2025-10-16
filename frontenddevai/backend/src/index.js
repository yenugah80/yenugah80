require('dotenv').config();
const express = require('express');
const database = require('./utils/database');
const Scheduler = require('./utils/scheduler');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: database.isConnected() ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'FrontendDevAI - Component Discovery Backend',
    version: '1.0.0',
    description: 'Automated frontend component discovery and update service',
    endpoints: {
      health: '/health',
      components: '/api/components',
      pending: '/api/components/pending',
      stats: '/api/stats',
      scraperStatus: '/api/scraper/status',
      schedulerStatus: '/api/scheduler/status'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Initialize and start server
async function startServer() {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await database.connect();

    // Initialize and start scheduler
    console.log('Initializing scheduler...');
    const scheduler = new Scheduler();
    scheduler.start();
    
    // Make scheduler available to routes
    app.locals.scheduler = scheduler;

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`FrontendDevAI Backend Server`);
      console.log(`${'='.repeat(60)}`);
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API endpoint: http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`${'='.repeat(60)}\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      scheduler.stop();
      await database.disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received. Shutting down gracefully...');
      scheduler.stop();
      await database.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
