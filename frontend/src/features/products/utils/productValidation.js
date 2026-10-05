export const productValidators = {
  name: (value) => {
    const name = value.trim();

    if (!name) {
      return 'Product name is required.';
    }

    if (name.length < 3) {
      return 'Product name must contain at least 3 characters.';
    }

    return '';
  },

  price: (value) => {
    if (value === '') {
      return 'Price is required.';
    }

    const price = Number(value);

    if (!Number.isFinite(price) || price <= 0) {
      return 'Price must be greater than 0.';
    }

    return '';
  },

  stock: (value) => {
    if (value === '') {
      return 'Initial stock is required.';
    }

    const stock = Number(value);

    if (!Number.isInteger(stock) || stock < 0) {
      return 'Stock must be a whole number and cannot be negative.';
    }

    return '';
  },

  category: (value) => {
    if (!value) {
      return 'Please select a category.';
    }

    return '';
  },

  gender: (value) => {
    if (!value) {
      return 'Please select a gender.';
    }

    return '';
  },

  description: (value) => {
    if (!value.trim()) {
      return 'Product description is required.';
    }

    return '';
  },

  material: (value) => {
    if (!value.trim()) {
      return 'Product material is required.';
    }

    return '';
  },
};
