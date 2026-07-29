import { body, param, query } from 'express-validator';
import validateRequest from '../middlewares/validation.js';
export const productIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

  validateRequest,
];

export const creaateReviewValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'), 

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment must be under 500 characters'),

  body('userId')
    .not().exists()
    .withMessage('userId is set automatically, do not send it manually'),

  body('verifiedPurchase')
    .not().exists()
    .withMessage('verifiedPurchase is calculated automatically, do not send it manually'),

  validateRequest,
];

export const updateReviewValidator = [
  param('reviewId')
    .isMongoId().withMessage('Invalid review ID'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment must be under 500 characters'),

  body('userId')
    .not().exists().withMessage('userId cannot be changed'),

  body('verifiedPurchase')
    .not().exists().withMessage('verifiedPurchase is calculated automatically, do not send it manually'),

  validateRequest,
];

export const reviewIdValidator = [
  param('reviewId')
    .isMongoId().withMessage('Invalid review ID'),

  validateRequest,
];
