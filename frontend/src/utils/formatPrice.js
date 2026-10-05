export function formatPrice(price) {
  if (price === null || price === undefined || price === '') {
    return 'Rp 0';
  }

  const value = Number(price);

  if (!Number.isFinite(value)) {
    return 'Rp 0';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('Rp', 'Rp ');
}
