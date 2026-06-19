import { sanitizeObject } from '../utils/sanitizeValue.js';
import { Request, Response, NextFunction } from 'express';

const EXCLUDED_FIELDS = ['password', 'confirmPassword', 'oldPassword', 'newPassword'];

const sanitizeHtml = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const preserved: Record<string, unknown> = {};
  const body = req.body as Record<string, unknown>;

  for (const field of EXCLUDED_FIELDS) {
    if (body && typeof body === 'object' && field in body) {
      preserved[field] = body[field];
    }
  }

  req.body = sanitizeObject(body);

  Object.assign(req.body, preserved);

  req.params = sanitizeObject(req.params) as Record<string, string>;

  const sanitizedQuery = sanitizeObject(req.query);
  Object.keys(req.query).forEach((key) => {
    delete (req.query as Record<string, unknown>)[key];
  });
  Object.assign(req.query, sanitizedQuery);

  next();
};

export default sanitizeHtml;