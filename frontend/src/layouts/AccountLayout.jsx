import AccountHeader from '../features/account/components/AccountHeader';
import AccountNavigation from '../features/account/components/AccountNavigation';

export default function AccountLayout({ title, description, eyebrow, children }) {
  return (
    <main className="bg-surface min-h-[100svh] pt-16 md:pt-18">
      <div className="mx-auto max-w-7xl px-5 pt-8 pb-2 sm:px-6 sm:py-10 md:px-8 md:py-14">
        <AccountHeader eyebrow={eyebrow} title={title} description={description} />

        <AccountNavigation />

        {children}
      </div>
    </main>
  );
}
