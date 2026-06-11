import { sanitizeObject } from '../utils/sanitizeValue.js';
import { Request, Response, NextFunction } from 'express';

const sanitizeHtml = (req: Request, res: Response, next: NextFunction): void => {
    req.body = sanitizeObject(req.body);
    req.params = sanitizeObject(req.params) as Record<string, string>;
    (req.query as Record<string, unknown>) = sanitizeObject(
        req.query as Record<string, unknown>
    );
    next();
};

export default sanitizeHtml;