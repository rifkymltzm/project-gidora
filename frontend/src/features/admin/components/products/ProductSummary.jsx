import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/utils/formatPrice';

export default function ProductSummary({ form, colors, sizes, onCancel, loading = false }) {
  return (
    <div>
      <Section
        title="PRODUCT SUMMARY"
        description="New catalog entry"
        contentClassName="p-5 sm:p-6"
      >
        <SummaryRow label="NAME" value={form.name || 'UNTITLED PRODUCT'} />

        <SummaryRow label="CATEGORY" value={form.category} />

        <SummaryRow label="GENDER" value={form.gender} />

        <SummaryRow label="PRICE" value={formatPrice(form.price)} />

        <SummaryRow label="STOCK" value={`${form.stock || 0} UNITS`} />

        <SummaryRow label="COLORS" value={colors.length ? colors.join(' / ') : 'NOT SET'} />

        <SummaryRow label="SIZES" value={sizes.length ? sizes.join(' / ') : 'NOT SET'} last />
      </Section>

      <section className="border-border-subtle bg-surface-container-lowest border p-5 sm:p-6">
        <Button type="submit" iconPosition="left" size="full" icon="add" loading={loading}>
          ADD PRODUCT
        </Button>

        <Button type="button" variant="secondary" size="full" className="mt-3" onClick={onCancel}>
          CANCEL
        </Button>
      </section>
    </div>
  );
}

function SummaryRow({ label, value, last = false }) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-3 ${
        !last ? 'border-border-subtle border-b' : ''
      }`}
    >
      <span className="font-label text-text-muted shrink-0">{label}</span>

      <span className="font-technical-data text-primary min-w-0 text-right uppercase">{value}</span>
    </div>
  );
}
