const variants = {
  primary: 'border-primary text-primary hover:border-text-muted hover:text-text-muted',

  subtle: 'border-transparent text-primary hover:border-primary',

  muted: 'border-transparent text-text-muted hover:border-primary hover:text-primary',

  danger: 'border-transparent text-text-muted hover:border-error hover:text-error',

  inverse:
    'border-surface-white text-surface-white hover:border-outline-variant hover:text-outline-variant',

  accent: 'border-transparent text-secondary hover:border-secondary hover:text-secondary',

  'accent-muted':
    'border-transparent text-on-secondary-container hover:border-secondary hover:text-secondary',
};

const underlineDirections = {
  left: 'after:origin-left',
  right: 'after:origin-right',
};

export default function TextButton({
  children,
  icon,
  variant = 'primary',
  iconPosition = 'right',

  underline = true,
  animateUnderline = false,
  underlineDirection = 'left',

  animateIcon = false,
  className = '',

  as: Component = 'button',

  ...props
}) {
  const iconAnimation = animateIcon
    ? iconPosition === 'left'
      ? 'group-hover:-translate-x-1'
      : 'group-hover:translate-x-1'
    : '';

  const underlineClasses = underline
    ? animateUnderline
      ? `after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-350 after:ease-out ${underlineDirections[underlineDirection]}`
      : 'after:scale-x-100'
    : '';

  const iconElement = icon ? (
    <span
      className={`material-symbols-outlined !text-[15px] transition-transform duration-350 ${iconAnimation}`}
      aria-hidden="true"
    >
      {icon}
    </span>
  ) : null;

  return (
    <Component
      {...(Component === 'button' && { type: 'button' })}
      className={`group font-label-caps relative inline-flex w-fit cursor-pointer items-center gap-2 pb-1 ${
        underline
          ? "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:bg-current after:content-['']"
          : ''
      } ${underlineClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {iconPosition === 'left' && iconElement}

      {children}

      {iconPosition === 'right' && iconElement}
    </Component>
  );
}
