import cloudinary from '../config/cloudinary.js';
import type { CloudinaryUploadResult } from '../interface/icategory.js';

const ROOT_FOLDER = process.env.CLOUDINARY_ROOT_FOLDER || 'default-project';
export const uploadTopCloudinary = (buffer: Buffer, folder: string): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `${ROOT_FOLDER}/${folder}` },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        if (!result) {
          return reject(new Error('Cloudinary upload failed: no result returned'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );
    stream.end(buffer);
  });
};