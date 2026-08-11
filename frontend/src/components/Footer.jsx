export default function Footer() {
  return (
    <footer className="bg-brand-light text-brand-dark">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div>
            <h2 className="text-lg font-bold">MyStore</h2>

            <p className="mt-2 text-sm">
              Your simple and trusted online store.
            </p>
          </div>

          <div className="text-sm">© 2026 MyStore. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
