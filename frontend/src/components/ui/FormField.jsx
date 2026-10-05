import ErrorMessage from './ErrorMessage';

export default function FormField({
  id,
  label,
  error,
  hint,
  required = false,
  labelClassName = 'text-tertiary-container',
  children,
}) {
  return (
    <div data-validation-error={error ? 'true' : undefined}>
      <label htmlFor={id} className={`font-label-caps mb-1.5 block ${labelClassName}`}>
        {label}

        {required && (
          <span className="text-error ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {hint && <p className="font-technical-data text-text-muted mt-1.5">{hint}</p>}

      <ErrorMessage id={`${id}-error`}>{error}</ErrorMessage>
    </div>
  );
}
