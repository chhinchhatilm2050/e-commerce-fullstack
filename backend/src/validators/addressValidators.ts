import { body } from 'express-validator';
import validateRequest from '../middlewares/validation.js';

export const saveAddressValidator = [
  body('streetAddress')
    .trim()
    .notEmpty()
    .withMessage('Street is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Street must be between 2 and 100 characters'),
  body('province')
    .trim()
    .notEmpty()
    .withMessage('Province is required'),
  body('district')
    .trim() 
    .notEmpty()
    .withMessage('District is required'),
  body('commune')
    .trim()
    .notEmpty()
    .withMessage('Commune is required'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .withMessage('Invalid phone number format'),
  body('label')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Label must be between 2 and 50 characters'),
  validateRequest,
];