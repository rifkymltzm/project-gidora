import { useCallback, useState } from 'react';

export default function useForm({ initialValues, validators = {} }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (name, value) => {
      const validator = validators[name];

      return validator ? validator(value ?? '') : '';
    },
    [validators],
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    Object.entries(validators).forEach(([name, validator]) => {
      const error = validator(values[name] ?? '');

      if (error) {
        newErrors[name] = error;
      }
    });

    return newErrors;
  }, [validators, values]);

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (touched[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: validateField(name, value),
        }));
      }
    },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    (name, value = values[name]) => {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    },
    [validateField, values],
  );

  const setForm = useCallback((nextValues) => {
    setValues(nextValues);
    setErrors({});
    setTouched({});
  }, []);

  const resetForm = useCallback(
    (nextValues = initialValues) => {
      setValues(nextValues);
      setErrors({});
      setTouched({});
    },
    [initialValues],
  );

  const touchAll = useCallback(() => {
    setTouched(
      Object.keys(validators).reduce((acc, name) => {
        acc[name] = true;
        return acc;
      }, {}),
    );
  }, [validators]);

  const validate = useCallback(() => {
    const newErrors = validateForm();

    setErrors(newErrors);
    touchAll();

    return newErrors;
  }, [touchAll, validateForm]);

  return {
    values,
    errors,
    touched,

    setValues,
    setValue,
    setForm,
    setErrors,
    setTouched,

    validateField,
    validateForm,
    validate,
    handleBlur,
    resetForm,
  };
}
