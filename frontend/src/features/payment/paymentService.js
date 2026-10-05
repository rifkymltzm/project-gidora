export async function createMockPayment({ orderId, paymentMethod, amount }) {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: `PAY-${Date.now()}`,
    orderId,
    paymentMethod,
    amount,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
}
