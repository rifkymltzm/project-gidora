export function buildProductPayload({ form, colors, sizes, images }) {
  return {
    name: form.name.trim(),
    price: Number(form.price),
    category: form.category,
    gender: form.gender,
    badge: form.badge.trim(),
    stock: Number(form.stock),
    colors,
    sizes,
    description: form.description.trim(),
    material: form.material.trim(),
    images,
  };
}
