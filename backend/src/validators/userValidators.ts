import { body, param } from 'express-validator';
import validateRequest from '../middlewares/validation.js';
import {
  isEmailUnique,
  PASSWORD_REGEX,
  NAME_REGEX,
  PHONE_REGEX,
} from '../utils/validators.js';
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name can be 2-50 characters')
    .matches(NAME_REGEX)
    .withMessage('First name can only cotain letters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name can be 2-50 characters')
    .matches(NAME_REGEX)
    .withMessage('Last name can only cotain letters'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(PHONE_REGEX)
    .withMessage('Invalid phone number. (e.g., 012345678 or +85512345678)'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail({ gmail_remove_dots: false })
    .custom(isEmailUnique),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must contain uppercase, lowercase, number, and special character',
    ),
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  validateRequest,
];

const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name can be 2-50 characters')
    .matches(NAME_REGEX)
    .withMessage('First name can only cotain letters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name can be 2-50 characters')
    .matches(NAME_REGEX)
    .withMessage('Last name can only cotain letters'),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(PHONE_REGEX)
    .withMessage('Invalid phone number. (e.g., 012345678 or +85512345678)'),
  body('gender').optional().notEmpty().withMessage('Gender is required'),
  validateRequest,
];

const userIdValidation = [
  param('id').isMongoId().withMessage('Invalid user id'),
  validateRequest,
];

const verifyEmailValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail({ gmail_remove_dots: false })
];
const verifyResetCodeValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('code')
    .notEmpty()
    .withMessage('Code is required')
];

const resetPassValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must contain uppercase, lowercase, number, and special character',
    ),
];

export { 
  registerValidation, 
  updateUserValidation, 
  userIdValidation, 
  verifyEmailValidation, 
  verifyResetCodeValidation,
  resetPassValidator
};
