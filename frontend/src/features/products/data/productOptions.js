export const PRODUCT_CATEGORIES = ['Outerwear', 'Pants', 'Shirts', 'Accessories', 'Footwear'];

export const PRODUCT_GENDERS = ['men', 'women', 'unisex'];

export const PRODUCT_COLORS = ['black', 'white', 'gray', 'navy', 'olive', 'beige', 'pink'];

export const SIZE_TYPES = [
  {
    value: 'apparel',
    label: 'APPAREL',
    description: 'S / M / L / XL / XXL',
    sizes: ['s', 'm', 'l', 'xl', 'xxl'],
  },
  {
    value: 'footwear',
    label: 'FOOTWEAR',
    description: 'EU 39 / 40 / 41 / 42 / 43 / 44 / 45',
    sizes: ['39', '40', '41', '42', '43', '44', '45'],
  },
  {
    value: 'one_size',
    label: 'ONE SIZE',
    description: 'Single universal size',
    sizes: ['one-size'],
  },
];

export const CATEGORY_SIZE_TYPES = {
  Outerwear: 'apparel',
  Pants: 'apparel',
  Shirts: 'apparel',
  Accessories: 'one_size',
  Footwear: 'footwear',
};

export function getSizeType(type) {
  return SIZE_TYPES.find((item) => item.value === type) ?? null;
}

export function getSizeTypeByCategory(category) {
  const type = CATEGORY_SIZE_TYPES[category] ?? 'apparel';

  return getSizeType(type);
}

/* =========================================================
   SHIPPING & RETURNS / CARE
========================================================= */

export const CATEGORY_PRODUCT_INFO = {
  Outerwear: {
    shipping:
      'Complimentary standard shipping on all orders over IDR 1.000.000. Orders are processed within 1-2 business days. Returns are accepted within 14 days of delivery for unworn items.',

    care: 'Machine wash cold with like colors. Do not bleach. Line dry in shade. Iron on low heat if necessary. Do not dry clean.',
  },

  Pants: {
    shipping:
      'Complimentary standard shipping on all orders over IDR 1.000.000. Orders are processed within 1-2 business days. Returns are accepted within 14 days of delivery for unworn items.',

    care: 'Machine wash cold with like colors. Do not bleach. Line dry in shade. Iron on low heat if necessary. Do not dry clean.',
  },

  Shirts: {
    shipping:
      'Complimentary standard shipping on all orders over IDR 1.000.000. Orders are processed within 1-2 business days. Returns are accepted within 14 days of delivery for unworn items.',

    care: 'Machine wash cold with like colors. Do not bleach. Line dry in shade. Iron on low heat if necessary. Do not dry clean.',
  },

  Accessories: {
    shipping:
      'Complimentary standard shipping on all orders over IDR 1.000.000. Orders are processed within 1-2 business days. Returns are accepted within 14 days of delivery for unused items.',

    care: 'Wipe clean with a soft damp cloth. Do not bleach or machine wash. Allow to air dry naturally and keep away from prolonged direct heat.',
  },

  Footwear: {
    shipping:
      'Complimentary standard shipping on all orders over IDR 1.000.000. Orders are processed within 1-2 business days. Returns are accepted within 14 days of delivery for unworn footwear in its original condition.',

    care: 'Clean gently with a soft brush or damp cloth. Do not machine wash. Allow to air dry naturally and avoid prolonged exposure to direct heat or sunlight.',
  },
};

const DEFAULT_PRODUCT_INFO = {
  shipping:
    'Complimentary standard shipping on all orders over IDR 1.000.000. Orders are processed within 1-2 business days. Returns are accepted within 14 days of delivery for unworn items.',

  care: 'Machine wash cold with like colors. Do not bleach. Line dry in shade. Iron on low heat if necessary. Do not dry clean.',
};

export function getProductInfo(category) {
  return CATEGORY_PRODUCT_INFO[category] ?? DEFAULT_PRODUCT_INFO;
}
