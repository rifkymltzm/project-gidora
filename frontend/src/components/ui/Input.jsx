export default function Input({ error = false, disabled = false, className = '', ...props }) {
  return (
    <input
      {...props}
      disabled={disabled}
      aria-invalid={error || undefined}
      className={`font-input text-secondary placeholder:text-secondary/45 hover:border-outline focus:border-primary disabled:border-border-subtle disabled:text-text-muted mt-2 h-11 w-full border-0 border-b bg-transparent px-0 transition-colors duration-200 outline-none focus:ring-0 disabled:cursor-default ${
        error ? 'border-error focus:border-error' : 'border-border-subtle'
      } ${className} `}
    />
  );
}
