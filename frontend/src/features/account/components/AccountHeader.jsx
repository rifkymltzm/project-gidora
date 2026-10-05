export default function AccountHeader({ title, description, eyebrow = 'ACCOUNT' }) {
  return (
    <header className="border-border-subtle border-b pb-6 md:pb-8">
      <p className="font-label-caps text-text-muted">{eyebrow}</p>

      <h1 className="font-headline-lg-mobile text-primary md:font-headline-lg mt-2 sm:mt-3">
        {title}
      </h1>

      <p className="font-body-md text-text-muted mt-2 max-w-md sm:mt-3">{description}</p>
    </header>
  );
}
