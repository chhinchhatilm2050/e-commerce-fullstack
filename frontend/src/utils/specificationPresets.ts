export interface ISpecificationPreset {
  category: string;
  icon: string;
  specs: { key: string; value: string }[];
}

export const CATEGORY_SPEC_PRESETS: ISpecificationPreset[] = [
  {
    category: 'Clothes',
    icon: 'ri-shirt-line',
    specs: [
      { key: 'Size', value: 'S, M, L, XL' },
      { key: 'Color', value: 'Black, White, Blue' },
      { key: 'Material', value: '100% Cotton' },
      { key: 'Fit Type', value: 'Regular Fit' },
      { key: 'Care Instructions', value: 'Machine wash cold' },
    ],
  },
  {
    category: 'Electronics',
    icon: 'ri-macbook-line',
    specs: [
      { key: 'Brand', value: 'TechBrand' },
      { key: 'Model', value: 'Pro v2' },
      { key: 'Warranty', value: '1 Year Limited' },
      { key: 'Power Supply', value: '100-240V' },
      { key: 'Connectivity', value: 'Bluetooth 5.2, Wi-Fi 6' },
    ],
  },
  {
    category: 'Furniture',
    icon: 'ri-sofa-line',
    specs: [
      { key: 'Material', value: 'Oak Wood, Fabric' },
      { key: 'Dimensions', value: '120cm x 60cm x 75cm' },
      { key: 'Weight Capacity', value: '150 kg' },
      { key: 'Assembly Required', value: 'Yes' },
      { key: 'Color', value: 'Natural Wood' },
    ],
  },
  {
    category: 'Books',
    icon: 'ri-book-open-line',
    specs: [
      { key: 'Author', value: 'Author Name' },
      { key: 'Publisher', value: 'Publishing House' },
      { key: 'Language', value: 'English' },
      { key: 'ISBN', value: '978-3-16-148410-0' },
      { key: 'Page Count', value: '320' },
    ],
  },
];
