const CHECKOUT_SESSION_KEY = 'gidora-checkout-session';

export function saveCheckoutSession(data) {
  sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(data));
}

export function getCheckoutSession() {
  try {
    const stored = sessionStorage.getItem(CHECKOUT_SESSION_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearCheckoutSession() {
  sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
}
