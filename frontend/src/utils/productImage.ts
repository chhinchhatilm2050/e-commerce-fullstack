import type { IProductImage, IProduct } from '@/types/product';

export const getPrimaryImage = (product: IProduct): IProductImage | undefined => {
  if (!product.images || product.images.length === 0) {
    return undefined;
  }
  return product.images.find((img) => img.isPrimary) || product.images[0];
};

export const getSortedImages = (product: IProduct): IProductImage[] => {
  if (!product.images || product.images.length === 0) {
    return [];
  }
  return [...product.images].sort((a, b) => a.order - b.order);
};

