import { param, body } from 'express-validator';
import validateRequest from '../middlewares/validation.js';

export const updateOrderStatusValidator = [
  param('id').isMongoId().withMessage('Invalid status ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    .withMessage('Status must be active or inactive'),
  validateRequest,
];

export const isMongoIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID'),
  validateRequest,
];