const assets = import.meta.glob('../assets/**/*.{webp,png,jpg,jpeg,svg}', {
  eager: true,
  import: 'default',
});

export function getAsset(path) {
  return assets[`../assets/${path}`];
}
