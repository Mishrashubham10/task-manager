import mongoose from 'mongoose';

// ============ DB CONNECTION =============
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected Successfully :: ${conn.connection.host}`);
  } catch (err: any) {
    console.log('MongoDB Connection failed', err.message);
  }
};