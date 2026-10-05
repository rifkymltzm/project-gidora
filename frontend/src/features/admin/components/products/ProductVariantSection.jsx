import Section from '../../../../components/ui/Section';
import Button from '../../../../components/ui/Button';

import { PRODUCT_COLORS, getSizeTypeByCategory } from '../../../products/data/productOptions';

export default function ProductVariantSection({
  category,
  colors,
  sizes,
  onColorsChange,
  onSizesChange,
  errors = {},
}) {
  const sizeType = getSizeTypeByCategory(category);
  const sizeOptions = sizeType?.sizes ?? [];

  const toggleValue = (value, setter) => {
    setter((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  return (
    <Section
      title="VARIANTS"
      description="Available colors and sizes"
      contentClassName="space-y-7 p-5 sm:p-6 md:p-7"
    >
      <OptionGroup
        label="COLORS"
        options={PRODUCT_COLORS}
        selected={colors}
        onToggle={(value) => toggleValue(value, onColorsChange)}
        error={errors.colors}
      />

      <div className="bg-border-subtle h-px" />

      <div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-label-caps text-text-muted">SIZES</p>

            <p className="font-technical-data text-text-muted mt-1">{sizeType?.description}</p>
          </div>

          <span className="font-technical-data text-text-muted">{sizes.length} SELECTED</span>
        </div>

        <div className="mt-3">
          <OptionGroup
            options={sizeOptions}
            selected={sizes}
            onToggle={(value) => toggleValue(value, onSizesChange)}
            error={errors.sizes}
          />
        </div>
      </div>
    </Section>
  );
}

function OptionGroup({ label, options, selected, onToggle, error }) {
  return (
    <div data-validation-error={error ? 'true' : undefined}>
      {label && <p className="font-label-caps text-text-muted">{label}</p>}

      <div className={`${label ? 'mt-3' : ''} flex flex-wrap gap-2`}>
        {options.map((option) => {
          const active = selected.includes(option);

          return (
            <Button
              key={option}
              type="button"
              variant={active ? 'primary' : 'secondary'}
              size="sm"
              icon={active ? 'check' : undefined}
              iconPosition="left"
              onClick={() => onToggle(option)}
            >
              {option}
            </Button>
          );
        })}
      </div>

      {error && <p className="font-technical-data text-error mt-3">{error}</p>}
    </div>
  );
}
