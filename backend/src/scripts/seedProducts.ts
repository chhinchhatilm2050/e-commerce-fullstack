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

// Incrementing counter used to assign each seeded product a unique 10-digit
// code without needing a DB round-trip (unlike the pre('save') hook, which
// checks uniqueness via ProductModel.exists() on every real product creation).
// Declared once at module scope so it persists across the whole seed run.
let codeCounter = 1_000_000_000;
// Reliable direct Unsplash images organized by keyword
// 20 high-quality, real Unsplash photos per category keyword
const categoryImagePool: Record<string, string[]> = {
  books: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73',
    'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6',
    'https://images.unsplash.com/photo-1519682337058-a94d519337bc',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe',
    'https://images.unsplash.com/photo-1510172951991-856a654063f9',
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da',
    'https://images.unsplash.com/photo-1463320726281-696a485928c7',
    'https://images.unsplash.com/photo-1526243741027-444d633d7342',
    'https://images.unsplash.com/photo-1535905557558-afc4877a26fc',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0',
    'https://images.unsplash.com/photo-1491841573634-28140fc7ced7',
  ],
  technology: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37',
    'https://images.unsplash.com/photo-1507646298591-240167667825',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
  ],
  fashion: [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e',
    'https://images.unsplash.com/photo-1564584217132-42711da07edf',
    'https://images.unsplash.com/photo-1516762689617-e1cffcef479d',
    'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
    'https://images.unsplash.com/photo-1548883354-7622d03aca27',
  ],
  furniture: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5',
    'https://images.unsplash.com/photo-1540518614846-7ede433c5173',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae',
    'https://images.unsplash.com/photo-1519974719765-e6559eac2575',
    'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c',
    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88',
    'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f',
    'https://images.unsplash.com/photo-1520699049698-acd2fccb8cc8',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03',
    'https://images.unsplash.com/photo-1540574163026-643ea20ade25',
    'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  ],
};

function generateFakeImages(keyword: string, count: number) {
  const pool = categoryImagePool[keyword.toLowerCase()] || categoryImagePool['technology'];

  return Array.from({ length: count }).map((_, i) => {
    // Selects a random photo from the 20 available photos
    const baseUrl = faker.helpers.arrayElement(pool);
    const imageUrl = `${baseUrl}?auto=format&fit=crop&w=600&h=800&q=80`;

    return {
      url: imageUrl,
      publicId: `fake_${keyword.toLowerCase().replace(/\s+/g, '_')}_${faker.string.uuid()}`,
      isPrimary: i === 0,
      order: i,
    };
  });
}

function generateCategoryImage(keyword: string) {
  const pool = categoryImagePool[keyword.toLowerCase()] || categoryImagePool['technology'];
  const baseUrl = faker.helpers.arrayElement(pool);
  return `${baseUrl}?auto=format&fit=crop&w=600&h=800&q=80`;
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
          code: (codeCounter++).toString(), // pre-assigned, skips the hook's exists() check
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
  const distinctCodes = await ProductModel.distinct('code');
  console.log(`Total categories: ${catCount}, Total products: ${prodCount}`);
  console.log(`Distinct product codes: ${distinctCodes.length} (should match total products)`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});