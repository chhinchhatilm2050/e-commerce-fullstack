import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_DB;
    if (!mongoUri) {
      throw new Error('MONGO_DB environment variable is not defined');
    }
    await mongoose.connect(mongoUri, {
      dbName: 'e-commerce-fullstack',
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Mongo connection fail', error);
    process.exit(1);
  }
};

export default connectDB;
