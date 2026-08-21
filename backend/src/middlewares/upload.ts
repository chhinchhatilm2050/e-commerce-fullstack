import multer from 'multer';
import path from 'path';
import type { Request } from 'express';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];
    
    const ext = path.extname(file.originalname || '').toLowerCase();
    const isMimeValid = allowedMimeTypes.includes(file.mimetype);
    const isExtValid = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    
    if (isMimeValid || isExtValid) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .png, .jpeg, and .webp image formats are allowed!'));
    }
  },
});