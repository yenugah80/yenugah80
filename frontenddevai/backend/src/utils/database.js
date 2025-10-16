const mongoose = require('mongoose');

/**
 * Database connection manager
 */
class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/frontenddevai';
      
      this.connection = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      console.log('Database connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('Database connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('Database disconnected');
      });

      return this.connection;
    } catch (error) {
      console.error('Failed to connect to database:', error.message);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('Database disconnected');
    } catch (error) {
      console.error('Error disconnecting from database:', error.message);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new Database();
