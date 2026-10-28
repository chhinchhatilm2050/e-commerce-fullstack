import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import UserModel from '../model/user.js';
import type { IUser } from '../interface/iuser.js';
import connectDB from '../config/database.js';

dotenv.config();

const TOTAL_USERS = 1000;
const DEFAULT_PASSWORD = 'Password@123'; // must match your PASSWORD_REGEX
const SEED_EMAIL_DOMAIN = 'email.com';
const PHONEN = '092 950 972';

type Gender = 'male' | 'female' | 'other';
type Role = 'customer';
type Status = 'active' | 'inactive' | 'blocked';

interface SeedUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  gender: Gender;
  avatar: string;
  imagePublicId: string;
  role: Role;
  status: Status;
  isVerified: boolean;
  orderCount: number;
  totalSpent: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clean = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');

async function seedUsers(): Promise<void> {
  await connectDB();
  console.log('Connected to MongoDB');

  // Remove only previously seeded users (won't touch real users)
  const removed = await UserModel.deleteMany({
    email: { $regex: `@${SEED_EMAIL_DOMAIN}$` },
  });
  console.log(`Removed ${removed.deletedCount} old seeded users`);

  // insertMany skips pre('save'), so hash manually (once, reused)
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const users: SeedUser[] = Array.from({ length: TOTAL_USERS }, (_, i) => {
    const sex = faker.helpers.arrayElement<'male' | 'female'>(['male', 'female']);
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName(sex);
    const createdAt = faker.date.past({ years: 1 });
    const orderCount = faker.number.int({ min: 0, max: 40 });

    const gender = faker.helpers.weightedArrayElement<Gender>([
      { weight: 45, value: sex },
      { weight: 5, value: 'other' },
    ]);

    const status: Status =
      i === 0
        ? 'active'
        : faker.helpers.weightedArrayElement<Status>([
          { weight: 75, value: 'active' },
          { weight: 15, value: 'inactive' },
          { weight: 10, value: 'blocked' },
        ]);

    return {
      firstName,
      lastName,
      email: `${clean(firstName)}.${clean(lastName)}${i + 1}@${SEED_EMAIL_DOMAIN}`,
      phoneNumber: PHONEN,
      password: hashedPassword,
      gender,
      avatar: faker.image.avatar(),
      imagePublicId: '',
      role: 'customer',
      status,
      isVerified: true, // otherwise the TTL index deletes them after 2 minutes
      orderCount,
      totalSpent: orderCount * faker.number.int({ min: 10, max: 150 }),
      isDeleted: false,
      createdAt,
      updatedAt: createdAt,
    };
  });

  const result = await UserModel.insertMany(users as unknown as Partial<IUser>[], {
    ordered: false,
  });
  console.log(`Seeded ${result.length} users`);
  console.log(`Login with any seeded email and password: ${DEFAULT_PASSWORD}`);

  await mongoose.disconnect();
}

seedUsers().catch(async (err: unknown) => {
  console.error('Seeding failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});