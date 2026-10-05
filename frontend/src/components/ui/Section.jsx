export default function Section({
  title,
  description,
  children,
  className = '',
  contentClassName = '',
}) {
  return (
    <section className={`border-border-subtle bg-surface-container-lowest border ${className} `}>
      {(title || description) && (
        <header className="border-border-subtle border-b px-5 py-4 sm:px-6 sm:py-5 md:px-7">
          {title && <h2 className="font-label-caps text-primary">{title}</h2>}

          {description && <p className="font-technical-data text-text-muted mt-1">{description}</p>}
        </header>
      )}

      <div className={contentClassName}>{children}</div>
    </section>
  );
}
