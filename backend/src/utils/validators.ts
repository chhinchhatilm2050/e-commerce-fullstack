import UserModel from '../model/user.js';
import AppError from './appError.js';

const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX: RegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const NAME_REGEX: RegExp = /^[a-zA-Z\s]+$/;
const PHONE_REGEX: RegExp = /^(\+855|0)[1-9]\d{7,8}$/;

const isEmailUnique = async (email: string): Promise<boolean> => {
  const user = await UserModel.findOne({ email });
  if (user) {
    throw new AppError('Email already registered', 409);
  }
  return true;
};

export { EMAIL_REGEX, PASSWORD_REGEX, NAME_REGEX, PHONE_REGEX, isEmailUnique };
