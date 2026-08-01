import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import ProductModel from '../model/product.js';
import { CategoryModel } from '../model/category.js';
import connectDB from '../config/database.js';

async function cleanup() {
  await connectDB();
  console.log('Connected to DB');

  const productResult = await ProductModel.deleteMany({});
  console.log(`Deleted ${productResult.deletedCount} products`);

  const categoryResult = await CategoryModel.deleteMany({});
  console.log(`Deleted ${categoryResult.deletedCount} categories`);

  console.log('Cleanup complete');
  await mongoose.disconnect();
  process.exit(0);
}

cleanup().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});