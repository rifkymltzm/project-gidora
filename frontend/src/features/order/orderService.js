const ORDER_STORAGE_KEY = 'gidora-orders';

export function createOrder({
  customer,
  items,
  subtotal,
  shippingMethod,
  shipping,
  total,
  paymentMethod,
}) {
  const order = {
    id: createOrderId(),
    status: 'PENDING PAYMENT',
    paymentMethod,
    createdAt: new Date().toISOString(),

    customer: {
      fullName: customer.fullName.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      village: customer.village.trim(),
      district: customer.district.trim(),
      city: customer.city.trim(),
      province: customer.province.trim(),
      postalCode: customer.postalCode.trim(),
    },

    shipping: {
      method: shippingMethod,
      label: shipping.label,
      description: shipping.description,
      price: shipping.price,
    },

    items: items.map((item) => ({
      cartItemKey: item.cartItemKey,
      slug: item.slug,
      sku: item.sku ?? item.id,
      name: item.name,
      price: Number(item.price) || 0,
      image: item.image || '',
      color: item.color || '',
      size: item.size || '',
      quantity: item.quantity,
    })),

    subtotal,
    total,
  };

  saveOrders([order, ...getOrders()]);

  return order;
}

export function getOrder(orderId) {
  return getOrders().find((order) => order.id === orderId) ?? null;
}

export function getOrders() {
  try {
    const stored = localStorage.getItem(ORDER_STORAGE_KEY);

    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

export function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();

  const updatedOrders = orders.map((order) =>
    order.id === orderId ? { ...order, status: newStatus } : order,
  );

  saveOrders(updatedOrders);

  return updatedOrders;
}

function createOrderId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `GD-${date}-${random}`;
}
