import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import UserModel from '../model/user.js';
import connectDB from '../config/database.js';

const seedAdmin = async () => {
  await connectDB();
  const existing = await UserModel.findOne({ email: process.env.ADMIN_EMAIL});
  if (existing) {
    console.log('Admiin already exists');
    process.exit(0);
  }

  await UserModel.create({
    firstName: process.env.ADMIN_FIRST_NAME,
    lastName: process.env.ADMIN_LAST_NAME,
    phoneNumber: process.env.ADMIN_PHONE,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    gender: 'other',
    role: 'admin'
  });
  
  console.log('Admin created');
  process.exit(0);
};

await seedAdmin();