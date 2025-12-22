import mongoose from 'mongoose';
import 'dotenv/config'; // Ensure dotenv is loaded for process.env

const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in backend/.env');
    console.error('Please add your MongoDB Atlas connection string to backend/.env');
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB Atlas connected successfully.');
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB Atlas connection failed:');
    console.error(error.message);
    console.log('\nCommon causes:');
    console.log('1. IP Address not whitelisted in Atlas (Network Access tab).');
    console.log('2. Incorrect username or password in connection string.');
    console.log('3. Special characters in password not URL-encoded.');
    return false;
  }
};

export default connectDB;
