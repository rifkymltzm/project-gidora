export default function ErrorMessage({ id, children, className = '' }) {
  if (!children) return null;

  return (
    <div
      id={id}
      className={`font-technical-data text-error mt-2 flex items-center gap-1.5 ${className} `}
      role="alert"
    >
      <span className="material-symbols-outlined shrink-0 !text-[15px]" aria-hidden="true">
        error
      </span>

      <span>{children}</span>
    </div>
  );
}
