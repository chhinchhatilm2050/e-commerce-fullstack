import { IUser } from './model/user.ts';
import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null;
      resource?: Document;
    }
  }
}

export {};
