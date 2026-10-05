import PRODUCTS_DATA from '../../products/data/products';

export function getAdminProducts() {
  return PRODUCTS_DATA;
}

export function getAdminProduct(sku) {
  return PRODUCTS_DATA.find((product) => product.sku === sku) ?? null;
}

export function getProductStats() {
  const products = getAdminProducts();

  return {
    total: products.length,
    newProducts: products.filter((product) => product.badge === 'NEW').length,
    featured: products.filter((product) => product.badge === 'FEATURED').length,
    categories: new Set(products.map((product) => product.category)).size,
  };
}
