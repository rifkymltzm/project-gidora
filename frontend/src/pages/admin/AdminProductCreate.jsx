import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useForm from '../../hooks/useForm';

import { productValidators } from '../../features/products/utils/productValidation';

import ProductGeneralSection from '../../features/admin/components/products/ProductGeneralSection';
import ProductVariantSection from '../../features/admin/components/products/ProductVariantSection';
import ProductImageSection from '../../features/admin/components/products/ProductImageSection';
import ProductSummary from '../../features/admin/components/products/ProductSummary';
import TextButton from '@/components/ui/TextButton';

export default function AdminProductCreate() {
  const navigate = useNavigate();

  const { values, errors, setValue, setErrors, validate } = useForm({
    initialValues: {
      name: '',
      price: '',
      category: 'Outerwear',
      gender: 'unisex',
      badge: '',
      stock: '',
      description: '',
      material: '',
    },
    validators: productValidators,
  });

  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [images, setImages] = useState({
    primary: null,
    detail: null,
    secondary: [],
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSizes([]);
  }, [values.category]);

  const handleSubmit = (event) => {
    event.preventDefault();

    setSaved(false);

    const formErrors = validate();

    const variantErrors = {};

    if (!colors.length) {
      variantErrors.colors = 'Select at least one color.';
    }

    if (!sizes.length) {
      variantErrors.sizes = 'Select at least one size.';
    }

    if (!images.primary) {
      variantErrors.primaryImage = 'Primary product image is required.';
    }

    if (!images.detail) {
      variantErrors.detailImage = 'Detail product image is required.';
    }

    const allErrors = {
      ...formErrors,
      ...variantErrors,
    };

    if (Object.keys(allErrors).length) {
      setErrors(allErrors);

      requestAnimationFrame(() => {
        document.querySelector("[data-validation-error='true']")?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });

      return;
    }

    const payload = {
      name: values.name.trim(),
      price: Number(values.price),
      category: values.category,
      gender: values.gender,
      badge: values.badge.trim(),
      stock: Number(values.stock),
      colors,
      sizes,
      description: values.description.trim(),
      material: values.material.trim(),
      images,
    };

    console.log('CREATE PRODUCT:', payload);

    // TODO:
    // replace with API POST Django REST Framework

    setSaved(true);

    window.setTimeout(() => {
      navigate('/admin/products');
    }, 1200);
  };

  return (
    <div className="animate-page-enter w-full space-y-6">
      <header className="mb-8">
        <TextButton
          as={Link}
          to="/admin/products"
          variant="muted"
          icon="arrow_back"
          iconPosition="left"
          animateIcon
          underline={false}
        >
          BACK TO PRODUCTS
        </TextButton>

        <div className="mt-6">
          <p className="font-label-caps text-text-muted">PRODUCT / CREATE</p>

          <h1 className="font-headline-lg-mobile text-primary md:font-headline-display mt-3">
            ADD PRODUCT
          </h1>

          <p className="font-body-md text-text-muted mt-3 max-w-xl">
            Create a new product and add it to the catalog.
          </p>
        </div>
      </header>

      {saved && (
        <div className="border-primary bg-primary text-on-primary border px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined !text-[18px]">check_circle</span>

            <span className="font-label-caps">PRODUCT CREATED SUCCESSFULLY</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 space-y-6 lg:col-span-8">
            <ProductGeneralSection values={values} errors={errors} onChange={setValue} />

            <ProductVariantSection
              category={values.category}
              colors={colors}
              sizes={sizes}
              onColorsChange={setColors}
              onSizesChange={setSizes}
              errors={errors}
            />

            <ProductImageSection images={images} onChange={setImages} errors={errors} />
          </div>

          <aside className="min-w-0 lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <ProductSummary
                form={values}
                colors={colors}
                sizes={sizes}
                onCancel={() => navigate('/admin/products')}
              />
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
