import { body, param } from 'express-validator';
import validateRequest from '../middlewares/validation.js';

export const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('parentId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid parent category ID'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),

  body('slug')
    .not().exists().withMessage('Slug is auto-generated, do not send it manually'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 2, max: 500 })
    .withMessage('Name must be between 2 and 500 characters'),
  validateRequest,
];

export const updateCategoryValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),

  body('slug')
    .not().exists()
    .withMessage('Slug is auto-generated, do not send it manually'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 2, max: 500 })
    .withMessage('Name must be between 2 and 500 characters'),
  validateRequest,
];
export const categoryIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),
  validateRequest,
];

export const categorySlugValidator = [
  param('slug').trim()
    .notEmpty()
    .withMessage('Slug is required'),
  validateRequest,
];

export const moveCategoryValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('newParentId')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (value === null || value === '') return true;
      if (!/^[0-9a-fA-F]{24}$/.test(value as string)) throw new Error('Invalid parent category ID');
      if (value === req.params?.id) throw new Error('Category cannot be its own parent');
      return true;
    }),
  validateRequest,
];

export const updateCategoryStatusValidator = [
  param('id').isMongoId().withMessage('Invalid category ID'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  validateRequest,
];

export const deleteCategoryValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),
  validateRequest
];

export const restoreCategoryValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),
  validateRequest,
];

