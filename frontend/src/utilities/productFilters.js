// src/utilities/productFilters.js

export const DEFAULT_FILTERS = {
  category: "all",
  gender: "all",
  size: "all",
  color: "all",
};

export const FILTER_OPTIONS = {
  category: [
    ["all", "All"],
    ["outerwear", "Outerwear"],
    ["pants", "Pants"],
    ["shirts", "Shirts"],
    ["accessories", "Accessories"],
  ],

  gender: [
    ["all", "All"],
    ["men", "Men"],
    ["women", "Women"],
  ],

  size: [
    ["all", "All"],
    ["xs", "XS"],
    ["s", "S"],
    ["m", "M"],
    ["l", "L"],
    ["xl", "XL"],
  ],

  color: [
    ["all", "All"],
    ["black", "Black"],
    ["white", "White"],
    ["navy", "Navy"],
    ["olive", "Olive"],
    ["beige", "Beige"],
    ["grey", "Grey"],
    ["pink", "Pink"],
  ],
};

export const SORT_OPTIONS = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["price_low", "Price: Low to High"],
  ["price_high", "Price: High to Low"],
];

// =========================================================
// NORMALIZATION
// =========================================================

export const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
};

export const normalizeColors = (color) => {
  if (!color) {
    return [];
  }

  const values = Array.isArray(color) ? color : String(color).split(",");

  return values
    .map(normalizeValue)
    .map((value) => (value === "gray" ? "grey" : value))
    .filter(Boolean);
};

export const normalizeSizes = (sizes) => {
  if (!Array.isArray(sizes)) {
    return [];
  }

  return sizes.map(normalizeValue).filter(Boolean);
};

// =========================================================
// FILTER
// =========================================================

const GENDER_MAP = {
  men: ["men", "man", "unisex"],
  women: ["women", "woman", "unisex"],
};

export function filterProducts(products, filters = DEFAULT_FILTERS) {
  const {
    category = "all",
    gender = "all",
    size = "all",
    color = "all",
  } = filters;

  return products.filter((product) => {
    if (
      category !== "all" &&
      normalizeValue(product.category) !== normalizeValue(category)
    ) {
      return false;
    }

    if (gender !== "all") {
      const allowedGenders = GENDER_MAP[gender] || [normalizeValue(gender)];

      if (!allowedGenders.includes(normalizeValue(product.gender))) {
        return false;
      }
    }

    if (
      size !== "all" &&
      !normalizeSizes(product.sizes).includes(normalizeValue(size))
    ) {
      return false;
    }

    if (
      color !== "all" &&
      !normalizeColors(product.color).includes(normalizeValue(color))
    ) {
      return false;
    }

    return true;
  });
}

// =========================================================
// SORT
// =========================================================

export function sortProducts(products, sortBy = "featured") {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return a.priceNum - b.priceNum;

      case "price_high":
        return b.priceNum - a.priceNum;

      case "newest": {
        const aNew = a.badge === "NEW";
        const bNew = b.badge === "NEW";

        if (aNew !== bNew) {
          return aNew ? -1 : 1;
        }

        return Number(b.id) - Number(a.id);
      }

      case "featured":
      default:
        return Number(a.id) - Number(b.id);
    }
  });
}

// =========================================================
// FILTER + SORT
// =========================================================

export function getFilteredProducts(products, filters, sortBy) {
  return sortProducts(filterProducts(products, filters), sortBy);
}

// =========================================================
// ACTIVE FILTER COUNT
// =========================================================

export function getActiveFilterCount(filters = DEFAULT_FILTERS) {
  return Object.values(filters).filter((value) => value !== "all").length;
}
