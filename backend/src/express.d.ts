import { IUser } from './interface/iuser.ts';
import { Document } from 'mongoose';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends IUser {}
    interface Request {
      resource?: Document;
    }
  }
}

export {};
