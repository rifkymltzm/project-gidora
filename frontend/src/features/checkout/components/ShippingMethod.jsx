const SHIPPING_OPTIONS = [
  { id: 'regular', label: 'REGULAR', description: '3–5 business days', price: 15000 },
  { id: 'express', label: 'EXPRESS', description: '1–2 business days', price: 30000 },
];

export { SHIPPING_OPTIONS };

export default function ShippingMethod({ shippingMethod, onSelect }) {
  return (
    <section className="mt-12">
      <SectionTitle number="03" title="SHIPPING METHOD" />

      <div className="space-y-3">
        {SHIPPING_OPTIONS.map((option) => (
          <ShippingOption
            key={option.id}
            option={option}
            selected={shippingMethod === option.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function SectionTitle({ number, title }) {
  return (
    <div className="border-border-subtle mb-7 flex items-center gap-3 border-b pb-4">
      <span className="font-technical-data text-text-muted">{number}</span>
      <h2 className="font-label-caps text-primary tracking-widest">{title}</h2>
    </div>
  );
}

function ShippingOption({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      aria-pressed={selected}
      className={`flex w-full cursor-pointer items-center justify-between border p-5 text-left transition-colors duration-300 ${
        selected
          ? 'border-primary bg-surface-container-low'
          : 'border-border-subtle hover:border-primary'
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border ${selected ? 'border-primary' : 'border-border-subtle'}`}
        >
          {selected && <span className="bg-primary h-2 w-2" />}
        </span>
        <div>
          <p className="font-label-caps text-primary">{option.label}</p>
          <p className="font-technical-data text-text-muted mt-1">{option.description}</p>
        </div>
      </div>
      <span className="font-technical-data text-primary">{formatPriceOption(option.price)}</span>
    </button>
  );
}

function formatPriceOption(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}
