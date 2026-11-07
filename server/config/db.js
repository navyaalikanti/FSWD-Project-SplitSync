const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (uri && !uri.includes('<MY_MONGODB')) {
    try {
      console.log('Attempting connection to configured MongoDB...');
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`Primary MongoDB connection failed: ${error.message}`);
    }
  }

  // Fallback to local MongoDB
  try {
    const localUri = 'mongodb://127.0.0.1:27017/splitsync';
    console.log(`Attempting fallback to local MongoDB (${localUri})...`);
    const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
    return conn;
  } catch (localError) {
    console.error(`Local MongoDB connection failed: ${localError.message}`);
    console.warn('Server will continue running. Demo/in-memory fallback active.');
  }
};

module.exports = connectDB;
