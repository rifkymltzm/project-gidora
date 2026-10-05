export const required =
  (message = 'This field is required.') =>
  (value) => {
    if (!String(value ?? '').trim()) {
      return message;
    }

    return '';
  };

export const minLength = (length, message) => (value) => {
  const val = String(value ?? '').trim();

  if (!val) {
    return '';
  }

  if (val.length < length) {
    return message;
  }

  return '';
};

export const email = (value) => {
  const val = String(value ?? '').trim();

  if (!val) {
    return '';
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? '' : 'Enter a valid email address.';
};

export const phone = (value) => {
  const val = String(value ?? '').trim();

  if (!val) {
    return '';
  }

  const normalized = val.replace(/[\s-]/g, '');

  if (!/^(?:\+62|62|0)8\d{8,12}$/.test(normalized)) {
    return 'Enter a valid Indonesian phone number.';
  }

  return '';
};

export const postalCode = (value) => {
  const val = String(value ?? '').trim();

  if (!val) {
    return '';
  }

  return /^\d{5}$/.test(val) ? '' : 'Postal code must contain 5 digits.';
};

export const compose =
  (...validators) =>
  (value) => {
    for (const validator of validators) {
      const error = validator(value);

      if (error) {
        return error;
      }
    }

    return '';
  };
