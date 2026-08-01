export const categoryIconMap: Record<string, string> = {
  clothes: 'ri-shirt-fill',
  electronics: 'ri-tools-fill',
  books: 'ri-book-3-fill',
};

export const defaultCategoryIcon = 'ri-mac-fill';

export const getCategoryIcon = (slug: string): string => {
  return categoryIconMap[slug] || defaultCategoryIcon;
};

