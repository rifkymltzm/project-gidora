const variants = {
  primary:
    'border-primary bg-tertiary-container text-on-primary hover:bg-transparent hover:text-primary',

  secondary:
    'border-outline bg-transparent text-primary hover:border-primary hover:bg-tertiary-container hover:text-on-primary',

  selected: 'border-primary bg-primary text-on-primary',

  outline:
    'border-outline bg-transparent text-primary hover:border-primary hover:bg-surface-container',

  elevated:
    'border-transparent bg-surface-container-lowest text-primary shadow-sm hover:bg-surface-container hover:shadow-none',

  soft: 'border-transparent bg-surface-container text-primary hover:bg-surface-container-high',

  danger: 'border-error bg-error text-on-error hover:bg-transparent hover:text-error',

  'danger-outline': 'border-error bg-transparent text-error hover:bg-error hover:text-on-error',

  ghost: 'border-transparent bg-transparent text-primary hover:bg-surface-container',

  inverse:
    'border-surface-white bg-surface-white text-primary hover:border-outline-variant hover:bg-transparent hover:text-surface-white',

  accent:
    'border-secondary bg-secondary text-on-secondary hover:bg-transparent hover:text-secondary',

  'accent-soft':
    'border-transparent bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim',
};

const sizes = {
  sm: 'min-h-9 px-3',
  md: 'min-h-10 px-4',
  lg: 'min-h-12 px-5',
  full: 'min-h-12 w-full px-5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  iconFilled = false,
  loading = false,
  className = '',
  disabled = false,
  type = 'button',

  as: Component = 'button',

  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <Component
      {...props}
      {...(Component === 'button' && {
        type,
        disabled: isDisabled,
      })}
      aria-disabled={isDisabled || undefined}
      className={`group font-label-caps inline-flex cursor-pointer items-center justify-center gap-2 border transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
        variants[variant]
      } ${sizes[size]} ${className}`}
    >
      {loading && (
        <span className="material-symbols-outlined animate-spin !text-[16px]" aria-hidden="true">
          progress_activity
        </span>
      )}

      {!loading && icon && iconPosition === 'left' && (
        <span
          className={`material-symbols-outlined mt-[-1px] !text-[16px] ${
            iconFilled ? '[font-variation-settings:"FILL"_1]' : ''
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {children}

      {!loading && icon && iconPosition === 'right' && (
        <span
          className={`material-symbols-outlined mt-[-1px] !text-[16px] transition-transform duration-300 ${
            icon ? 'group-hover:translate-x-1' : ''
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
    </Component>
  );
}
