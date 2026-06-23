import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const CODE_EXPIRY_MINUTES = 2;
export const MAX_VERIFICATION_ATTEMPTS = 5;
const SALT_ROUNDS = 10;

export const generateVerificationCode = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const hashVerificationCode = async (code: string): Promise<string> => {
  return bcrypt.hash(code, SALT_ROUNDS);
};

export const compareVerificationCode = async(code: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(code, hash);
};

