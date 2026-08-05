import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import ProductModel from '../model/product.js';
import { CategoryModel } from '../model/category.js';
import connectDB from '../config/database.js';

interface SubcategoryConfig {
  name: string;
  productNameFn: () => string;
  specFn: () => Record<string, unknown>;
}

interface CategoryConfig {
  name: string;
  description: string;
  imageKeyword: string;
  subcategories: SubcategoryConfig[];
}

const categoryConfig: CategoryConfig[] = [
  {
    name: 'Books',
    description: 'Fiction, non-fiction, and everything in between',
    imageKeyword: 'books',
    subcategories: [
      {
        name: 'Fiction',
        productNameFn: () => faker.commerce.productName() + ' - ' + faker.person.lastName(),
        specFn: () => ({
          author: faker.person.fullName(),
          pages: faker.number.int({ min: 150, max: 700 }),
          language: faker.helpers.arrayElement(['English', 'Spanish', 'French']),
          publisher: faker.company.name(),
          isbn: faker.commerce.isbn(),
        }),
      },
      {
        name: 'Non-Fiction',
        productNameFn: () => faker.commerce.productName() + ' - ' + faker.person.lastName(),
        specFn: () => ({
          author: faker.person.fullName(),
          pages: faker.number.int({ min: 100, max: 900 }),
          language: faker.helpers.arrayElement(['English', 'Spanish', 'French']),
          publisher: faker.company.name(),
          isbn: faker.commerce.isbn(),
        }),
      },
      {
        name: 'Comics',
        productNameFn: () => faker.commerce.productName() + ' Vol. ' + faker.number.int({ min: 1, max: 20 }),
        specFn: () => ({
          author: faker.person.fullName(),
          pages: faker.number.int({ min: 20, max: 200 }),
          language: 'English',
          publisher: faker.company.name(),
          isbn: faker.commerce.isbn(),
        }),
      },
      {
        name: 'Children',
        productNameFn: () => faker.commerce.productName() + ' for Kids',
        specFn: () => ({
          author: faker.person.fullName(),
          pages: faker.number.int({ min: 10, max: 80 }),
          language: 'English',
          publisher: faker.company.name(),
          isbn: faker.commerce.isbn(),
        }),
      },
    ],
  },
  {
    name: 'Electronics',
    description: 'Gadgets, devices, and tech accessories',
    imageKeyword: 'technology',
    subcategories: [
      {
        name: 'Laptops',
        productNameFn: () => faker.company.buzzAdjective() + ' Laptop ' + faker.string.alphanumeric(4).toUpperCase(),
        specFn: () => ({
          brand: faker.company.name(),
          warrantyMonths: faker.helpers.arrayElement([6, 12, 24]),
          color: faker.color.human(),
          weightGrams: faker.number.int({ min: 1000, max: 3000 }),
        }),
      },
      {
        name: 'Phones',
        productNameFn: () => faker.company.buzzAdjective() + ' Phone ' + faker.string.alphanumeric(4).toUpperCase(),
        specFn: () => ({
          brand: faker.company.name(),
          warrantyMonths: faker.helpers.arrayElement([6, 12, 24]),
          color: faker.color.human(),
          weightGrams: faker.number.int({ min: 120, max: 250 }),
        }),
      },
      {
        name: 'Audio',
        productNameFn: () => faker.helpers.arrayElement(['Headphones', 'Earbuds', 'Speaker']) + ' ' + faker.company.buzzNoun(),
        specFn: () => ({
          brand: faker.company.name(),
          warrantyMonths: faker.helpers.arrayElement([6, 12, 24]),
          color: faker.color.human(),
          weightGrams: faker.number.int({ min: 50, max: 500 }),
        }),
      },
      {
        name: 'Cameras',
        productNameFn: () => faker.company.buzzAdjective() + ' Camera ' + faker.string.alphanumeric(4).toUpperCase(),
        specFn: () => ({
          brand: faker.company.name(),
          warrantyMonths: faker.helpers.arrayElement([6, 12, 24]),
          color: faker.color.human(),
          weightGrams: faker.number.int({ min: 300, max: 1200 }),
        }),
      },
    ],
  },
  {
    name: 'Clothes',
    description: 'Apparel for men, women, and kids',
    imageKeyword: 'fashion',
    subcategories: [
      {
        name: 'Men',
        productNameFn: () => faker.commerce.productAdjective() + ' ' + faker.commerce.productMaterial() + ' ' + faker.commerce.product(),
        specFn: () => ({
          size: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL']),
          color: faker.color.human(),
          material: faker.commerce.productMaterial(),
          gender: 'men',
        }),
      },
      {
        name: 'Women',
        productNameFn: () => faker.commerce.productAdjective() + ' ' + faker.commerce.productMaterial() + ' ' + faker.commerce.product(),
        specFn: () => ({
          size: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL']),
          color: faker.color.human(),
          material: faker.commerce.productMaterial(),
          gender: 'women',
        }),
      },
      {
        name: 'Kids',
        productNameFn: () => faker.commerce.productAdjective() + ' Kids ' + faker.commerce.product(),
        specFn: () => ({
          size: faker.helpers.arrayElement(['2T', '4T', 'S', 'M']),
          color: faker.color.human(),
          material: faker.commerce.productMaterial(),
          gender: 'unisex',
        }),
      },
      {
        name: 'Accessories',
        productNameFn: () => faker.commerce.productAdjective() + ' ' + faker.helpers.arrayElement(['Belt', 'Scarf', 'Hat', 'Bag']),
        specFn: () => ({
          size: 'One Size',
          color: faker.color.human(),
          material: faker.commerce.productMaterial(),
          gender: 'unisex',
        }),
      },
    ],
  },
];

const PRODUCT_PER_SUBCATEGORY = 60;

// Uses Faker's LoremFlickr generator to fetch real photos matching category keywords
function generateFakeImages(keyword: string, count: number) {
  return Array.from({ length: count }).map((_, i) => ({
    url: faker.image.urlLoremFlickr({ width: 400, height: 600, category: keyword }),
    publicId: `fake_${keyword.toLowerCase().replace(/\s+/g, '_')}_${faker.string.uuid()}`,
    isPrimary: i === 0,
    order: i,
  }));
}

function generateCategoryImage(keyword: string) {
  return faker.image.urlLoremFlickr({ width: 400, height: 600, category: keyword });
}

const seed = async () => {
  await connectDB();
  console.log('Connect to DB');

  for (const category of categoryConfig) {
    const parentDoc = await CategoryModel.create({
      name: category.name,
      description: category.description,
      image: generateCategoryImage(category.imageKeyword),
      imagePublicId: `fake_category_${faker.string.uuid()}`,
      status: 'active',
    });
    console.log(`Created top category: ${parentDoc.name} (${parentDoc.slug})`);

    for (const sub of category.subcategories) {
      const subDoc = await CategoryModel.create({
        name: `${category.name} ${sub.name}`,
        description: `${sub.name} under ${category.name}`,
        parentId: parentDoc._id,
        image: generateCategoryImage(category.imageKeyword),
        imagePublicId: `fake_category_${faker.string.uuid()}`,
        status: 'active',
      });
      console.log(`   Created subcategory: ${subDoc.name} (${subDoc.slug})`);

      let created = 0;
      for (let i = 0; i < PRODUCT_PER_SUBCATEGORY; i++) {
        await ProductModel.create({
          name: sub.productNameFn(),
          description: faker.commerce.productDescription(),
          categoryId: subDoc._id,
          price: Number(faker.commerce.price({ min: 5, max: 1000 })),
          comparePrice: faker.datatype.boolean()
            ? Number(faker.commerce.price({ min: 5, max: 1200 }))
            : undefined,
          images: generateFakeImages(category.imageKeyword, faker.number.int({ min: 1, max: 4 })),
          stock: faker.number.int({ min: 0, max: 200 }),
          specification: sub.specFn(),
          status: faker.helpers.arrayElement(['active', 'active', 'active', 'draft']),
        });
        created++;
      }
      console.log(`Seeded ${created} products in ${subDoc.name}`);
    }
  }

  console.log('Seeding complete');
  const catCount = await CategoryModel.countDocuments();
  const prodCount = await ProductModel.countDocuments();
  console.log(`Total categories: ${catCount}, Total products: ${prodCount}`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});