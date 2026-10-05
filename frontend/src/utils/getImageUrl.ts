import type { IProductImage } from '@/types/product';
export const getImageUrl = (image: string | IProductImage): string => {
  if (!image) return '/placeholder.png';
  if (typeof image === 'string' && image.startsWith('http')) {
    return image;
  }
  if (typeof image === 'string') {
    const match = image.match(/url:\s*['"]([^'"]+)['"]/);
    if (match && match[1]) return match[1];

    try {
      const parsed = JSON.parse(image);
      return parsed.url || '/placeholder.png';
    } catch {
      return '/placeholder.png';
    }
  }
  return image.url || '/placeholder.png';
};
