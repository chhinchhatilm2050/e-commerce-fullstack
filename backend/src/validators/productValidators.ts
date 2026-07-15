import { body, param, query } from 'express-validator';
import validateRequest from '../middlewares/validation.js';

export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description too long'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('comparePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number'), 

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('categoryId')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be true or false'),

  body('ratingAvg')
    .not().exists()
    .withMessage('ratingAvg is calculated automatically, do not send it manually'),

  body('ratingCount')
    .not().exists()
    .withMessage('ratingCount is calculated automatically, do not send it manually'),
    
  validateRequest, 
];

export const updateProductValidator = [
  param('id').isMongoId()
    .withMessage('Invalid product ID'),

  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description too long'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('comparePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Compare price must be a positive number'),

  body('categoryId')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),
  
  validateRequest,
];

export const productIdValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  validateRequest,
];

export const updateStockValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  validateRequest,
];

export const updateStatusValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('isActive')
    .notEmpty().withMessage('isActive is required')
    .isBoolean().withMessage('isActive must be true or false'),
  validateRequest,
];

export const removeImageValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('publicId').trim().notEmpty().withMessage('publicId is required'),
  validateRequest,
];

export const getAllProductsValidator = [
  query('sort')
    .optional()
    .isIn(['recommend', 'newest', 'price_high', 'price_low', 'discount_high', 'discount_low'])
    .withMessage('Invalid sort option'),

  query('page').optional().isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit').optional().isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1-100'),

  query('minPrice').optional().isFloat({ min: 0 })
    .withMessage('minPrice must be a positive number'),

  query('maxPrice').optional().isFloat({ min: 0 })
    .withMessage('maxPrice must be a positive number'),

  query('categoryId').optional().isMongoId()
    .withMessage('Invalid category ID'),

  validateRequest,
];

export const searchProductValidator = [
  query('search').trim().notEmpty()
    .withMessage('Search query is required'),
  validateRequest,
];

