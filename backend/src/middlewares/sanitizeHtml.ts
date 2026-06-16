import { sanitizeObject } from '../utils/sanitizeValue.js';
import { Request, Response, NextFunction } from 'express';

const sanitizeHtml = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  req.body = sanitizeObject(req.body as Record<string, unknown>);

  req.params = sanitizeObject(req.params) as Record<string, string>;

  req.query = sanitizeObject(req.query) as typeof req.query; 

  next();
};

export default sanitizeHtml;