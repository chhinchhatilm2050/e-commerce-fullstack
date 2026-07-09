import cloudinary from '../config/cloudinary.js';

const ROOT_FOLDER = process.env.CLOUDINARY_ROOT_FOLDER || 'default-project';
export const uploadTopCloudinary = (buffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `${ROOT_FOLDER}/${folder}`},
      (error, result) => {
        if (!result) return reject(new Error('Cloudinary upload failed: no result returned'));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};