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

// --- Size/Color helpers -----------------------------------------------
// A product can have ONE size/color, MANY sizes/colors, or be "Free Size"
// (single universal size, e.g. belts, scarves, one-size hats).

function generateSizes(possibleSizes: string[], freeSizeProbability = 0): string[] {
  if (freeSizeProbability > 0 && faker.datatype.boolean({ probability: freeSizeProbability })) {
    return ['Free Size'];
  }
  const count = faker.number.int({ min: 1, max: Math.min(3, possibleSizes.length) });
  return faker.helpers.arrayElements(possibleSizes, count);
}

function generateColors(): string[] {
  const count = faker.number.int({ min: 1, max: 3 });
  const colors = Array.from({ length: count }, () => faker.color.human());
  return Array.from(new Set(colors)); // dedupe in case of repeats
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
          sizes: generateSizes(['XS', 'S', 'M', 'L', 'XL'], 0.1),
          colors: generateColors(),
          material: faker.commerce.productMaterial(),
          gender: 'men',
        }),
      },
      {
        name: 'Women',
        productNameFn: () => faker.commerce.productAdjective() + ' ' + faker.commerce.productMaterial() + ' ' + faker.commerce.product(),
        specFn: () => ({
          sizes: generateSizes(['XS', 'S', 'M', 'L', 'XL'], 0.1),
          colors: generateColors(),
          material: faker.commerce.productMaterial(),
          gender: 'women',
        }),
      },
      {
        name: 'Kids',
        productNameFn: () => faker.commerce.productAdjective() + ' Kids ' + faker.commerce.product(),
        specFn: () => ({
          sizes: generateSizes(['2T', '4T', 'S', 'M'], 0.05),
          colors: generateColors(),
          material: faker.commerce.productMaterial(),
          gender: 'unisex',
        }),
      },
      {
        name: 'Accessories',
        productNameFn: () => faker.commerce.productAdjective() + ' ' + faker.helpers.arrayElement(['Belt', 'Scarf', 'Hat', 'Bag']),
        specFn: () => ({
          // Accessories are frequently one-size items (belts, scarves, hats, bags)
          sizes: generateSizes(['S', 'M', 'L'], 0.6),
          colors: generateColors(),
          material: faker.commerce.productMaterial(),
          gender: 'unisex',
        }),
      },
    ],
  },
  {
    name: 'Furniture',
    description: 'Furniture and decor for every room in your home',
    imageKeyword: 'furniture',
    subcategories: [
      {
        name: 'Living Room',
        productNameFn: () => faker.commerce.productAdjective() + ' ' + faker.helpers.arrayElement(['Sofa', 'Coffee Table', 'TV Stand', 'Armchair', 'Bookshelf']),
        specFn: () => ({
          material: faker.helpers.arrayElement(['Wood', 'Metal', 'Fabric', 'Leather', 'Glass']),
          color: faker.color.human(),
          weightKg: faker.number.int({ min: 5, max: 60 }),
          dimensions: `${faker.number.int({ min: 60, max: 220 })}x${faker.number.int({ min: 40, max: 100 })}x${faker.number.int({ min: 30, max: 90 })} cm`,
        }),
      },
      {
        name: 'Bedroom',
        productNameFn: () => faker.commerce.productAdjective() + ' ' + faker.helpers.arrayElement(['Bed Frame', 'Wardrobe', 'Nightstand', 'Dresser', 'Mattress']),
        specFn: () => ({
          material: faker.helpers.arrayElement(['Wood', 'Metal', 'Fabric', 'Memory Foam']),
          color: faker.color.human(),
          weightKg: faker.number.int({ min: 8, max: 80 }),
          dimensions: `${faker.number.int({ min: 90, max: 200 })}x${faker.number.int({ min: 60, max: 180 })}x${faker.number.int({ min: 20, max: 120 })} cm`,
        }),
      },
      {
        name: 'Office',
        productNameFn: () => faker.commerce.productAdjective() + ' ' + faker.helpers.arrayElement(['Office Chair', 'Desk', 'Filing Cabinet', 'Bookcase']),
        specFn: () => ({
          material: faker.helpers.arrayElement(['Wood', 'Metal', 'Mesh', 'Plastic']),
          color: faker.color.human(),
          weightKg: faker.number.int({ min: 5, max: 40 }),
          adjustableHeight: faker.datatype.boolean(),
        }),
      },
      {
        name: 'Outdoor',
        productNameFn: () => faker.commerce.productAdjective() + ' ' + faker.helpers.arrayElement(['Patio Set', 'Garden Bench', 'Hammock', 'Outdoor Table']),
        specFn: () => ({
          material: faker.helpers.arrayElement(['Rattan', 'Metal', 'Teak Wood', 'Aluminum']),
          color: faker.color.human(),
          weatherResistant: true,
          weightKg: faker.number.int({ min: 3, max: 50 }),
        }),
      },
    ],
  },
];

const PRODUCT_PER_SUBCATEGORY = 100;

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

// generates a realistic rating: most products cluster around 3.5-4.8,
// with roughly 15% of products having zero reviews (rating 0, count 0)
function generateRating(): { ratingAvg: number; ratingCount: number } {
  const hasReviews = faker.datatype.boolean({ probability: 0.85 });

  if (!hasReviews) {
    return { ratingAvg: 0, ratingCount: 0 };
  }

  const ratingAvg = Number(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }));
  const ratingCount = faker.number.int({ min: 1, max: 500 });

  return { ratingAvg, ratingCount };
}

// derives status from stock — out of stock products are automatically marked as such,
// remaining products are mostly active with a small percentage left as draft
function generateStatus(stock: number): 'draft' | 'active' | 'out_of_stock' {
  if (stock === 0) return 'out_of_stock';
  return faker.helpers.arrayElement(['active', 'active', 'active', 'active', 'draft']);
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
        const { ratingAvg, ratingCount } = generateRating();
        const stock = faker.number.int({ min: 0, max: 200 });

        await ProductModel.create({
          name: sub.productNameFn(),
          description: faker.commerce.productDescription(),
          categoryId: subDoc._id,
          price: Number(faker.commerce.price({ min: 5, max: 1000 })),
          comparePrice: faker.datatype.boolean()
            ? Number(faker.commerce.price({ min: 5, max: 1200 }))
            : undefined,
          images: generateFakeImages(category.imageKeyword, faker.number.int({ min: 1, max: 4 })),
          stock,
          specification: sub.specFn(),
          ratingAvg,
          ratingCount,
          status: generateStatus(stock),
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