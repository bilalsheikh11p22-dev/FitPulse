
const mongoose = require('mongoose');

let connectionPromise = null;

const connectDB = async () => {
  // Reuse an existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Wait for an existing connection attempt
  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error('MONGO_URI is missing from environment variables.');
  }

  connectionPromise = mongoose
    .connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(async (conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);

      return conn.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error('MongoDB connection failed:', error.message);
      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;
