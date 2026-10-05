export default function Textarea({ error = false, disabled = false, className = '', ...props }) {
  return (
    <textarea
      disabled={disabled}
      className={`font-body-md text-primary w-full resize-y rounded-none border-0 border-b bg-transparent px-0 py-3 transition-colors duration-300 outline-none focus:ring-0 ${
        error ? 'border-error focus:border-error' : 'border-border-subtle focus:border-primary'
      } ${disabled ? 'border-border-subtle text-text-muted cursor-default' : ''} ${className} `}
      {...props}
    />
  );
}
