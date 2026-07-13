import cloudinary from '../config/cloudinary.js';
import AppError from './appError.js';
export const deleteFromCaloudinay = async(publicId: string): Promise<void> => {
  if(!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    throw new AppError('Failed to delete old Cloudinary image', 400);
  }
};

