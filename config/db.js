// config/db.js
import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://ebongvalentine70_db_user:A6xfWkXtLHBG8aIm@cluster0.ugvu1jm.mongodb.net/'
    );
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// ✅ ES Module export
export default connectToDB; 