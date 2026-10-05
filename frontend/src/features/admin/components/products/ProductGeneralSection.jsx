import Input from '../../../../components/ui/Input';
import Textarea from '../../../../components/ui/Textarea';
import Select from '../../../../components/ui/Select';
import FormField from '../../../../components/ui/FormField';
import Section from '../../../../components/ui/Section';

import { PRODUCT_CATEGORIES, PRODUCT_GENDERS } from '../../../products/data/productOptions';

export default function ProductGeneralSection({ values, errors, onChange }) {
  return (
    <Section
      title="GENERAL INFORMATION"
      description="Core product information"
      contentClassName="space-y-6 p-5 sm:p-6 md:p-7"
    >
      <FormField id="name" label="PRODUCT NAME" required error={errors.name}>
        <Input
          id="name"
          value={values.name}
          onChange={(event) => onChange('name', event.target.value)}
          placeholder="e.g. GIDORA RIDING JACKET"
          error={Boolean(errors.name)}
        />
      </FormField>

      <FormField id="material" label="MATERIAL" error={errors.material}>
        <Input
          id="material"
          value={values.material}
          onChange={(event) => onChange('material', event.target.value)}
          placeholder="e.g. 100% Heavyweight Combed Cotton"
          error={Boolean(errors.material)}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField id="price" label="PRICE" required error={errors.price}>
          <Input
            id="price"
            type="number"
            min="0"
            value={values.price}
            onChange={(event) => onChange('price', event.target.value)}
            placeholder="2490000"
            error={Boolean(errors.price)}
          />
        </FormField>

        <FormField id="stock" label="INITIAL STOCK" required error={errors.stock}>
          <Input
            id="stock"
            type="number"
            min="0"
            value={values.stock}
            onChange={(event) => onChange('stock', event.target.value)}
            placeholder="10"
            error={Boolean(errors.stock)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField id="category" label="CATEGORY" required error={errors.category}>
          <Select
            id="category"
            value={values.category}
            options={PRODUCT_CATEGORIES}
            onChange={(value) => onChange('category', value)}
          />
        </FormField>

        <FormField id="gender" label="GENDER" required error={errors.gender}>
          <Select
            id="gender"
            value={values.gender}
            options={PRODUCT_GENDERS}
            onChange={(value) => onChange('gender', value)}
          />
        </FormField>
      </div>

      <FormField id="badge" label="BADGE">
        <Input
          id="badge"
          value={values.badge}
          onChange={(event) => onChange('badge', event.target.value)}
          placeholder="e.g. NEW"
        />
      </FormField>

      <FormField id="description" label="DESCRIPTION" required error={errors.description}>
        <Textarea
          id="description"
          rows={5}
          value={values.description}
          onChange={(event) => onChange('description', event.target.value)}
          placeholder="Describe the product..."
          error={Boolean(errors.description)}
        />
      </FormField>
    </Section>
  );
}
