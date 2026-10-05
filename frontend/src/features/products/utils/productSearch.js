export const normalize = (value) => {
  return String(value ?? '')
    .trim()
    .toLowerCase();
};

export const getSearchableProduct = (product) => {
  return {
    name: normalize(product.name),
    category: normalize(product.category),
    gender: normalize(product.gender),
    sku: normalize(product.sku),
    slug: normalize(product.slug),
    colors: product.colors?.map((color) => normalize(color.name)).filter(Boolean) ?? [],
  };
};

export const getProductSearchScore = (product, query) => {
  const { name, category, gender, sku, slug, colors } = getSearchableProduct(product);

  let score = 0;

  if (name === query) score += 100;
  else if (name.startsWith(query)) score += 80;
  else if (name.includes(query)) score += 60;

  if (category === query) score += 50;
  else if (category.includes(query)) score += 35;

  if (colors.includes(query)) score += 45;
  else if (colors.some((color) => color.includes(query))) score += 30;

  if (gender === query) score += 25;
  else if (gender.includes(query)) score += 15;

  if (sku === query) score += 40;
  else if (sku.includes(query)) score += 25;

  if (slug === query) score += 35;
  else if (slug.includes(query)) score += 20;

  return score;
};

export const searchProducts = (products, query, limit = 8) => {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  return products
    .map((product) => ({
      product,
      score: getProductSearchScore(product, normalizedQuery),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product);
};
