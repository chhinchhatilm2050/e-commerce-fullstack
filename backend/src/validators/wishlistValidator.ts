import { param } from 'express-validator';
import validateRequest from '../middlewares/validation.js';

export const productIdValidator = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  validateRequest,
];
