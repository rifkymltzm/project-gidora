import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import TextButton from '@/components/ui/TextButton';
import { useCart } from '@/features/cart/context/CartContext';
import { saveCheckoutSession } from '@/features/checkout/checkoutSessionService';
import useForm from '@/hooks/useForm';
import { compose, email, minLength, phone, postalCode, required } from '@/utils/validators';

import ContactInformation from '@/features/checkout/components/ContactInformation';
import ShippingAddress from '@/features/checkout/components/ShippingAddress';
import ShippingMethod, { SHIPPING_OPTIONS } from '@/features/checkout/components/ShippingMethod';
import OrderSummary, {
  UnavailableItemsNotice,
  EmptyCheckout,
} from '@/features/checkout/components/OrderSummary';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  village: '',
  district: '',
  city: '',
  province: '',
  postalCode: '',
};

const VALIDATORS = {
  fullName: compose(
    required('Full name is required.'),
    minLength(2, 'Your name must be at least 2 characters.'),
  ),
  email: compose(required('Email address is required.'), email),
  phone: compose(required('Phone number is required.'), phone),
  address: compose(
    required('Shipping address is required.'),
    minLength(10, 'Please enter your complete shipping address.'),
  ),
  village: required('Village / sub-district is required.'),
  district: required('District is required.'),
  city: compose(required('City / regency is required.'), minLength(2, 'Enter a valid city.')),
  province: compose(required('Province is required.'), minLength(2, 'Enter a valid province.')),
  postalCode: compose(required('Postal code is required.'), postalCode),
};

export default function Checkout() {
  const navigate = useNavigate();

  const { items, purchasableItems, totalItems, subtotal, hasUnavailableItems } = useCart();

  const [shippingMethod, setShippingMethod] = useState('regular');

  const {
    values: form,
    errors,
    setValue,
    validate,
    handleBlur,
  } = useForm({
    initialValues: INITIAL_FORM,
    validators: VALIDATORS,
  });

  const shipping = SHIPPING_OPTIONS.find(({ id }) => id === shippingMethod) ?? SHIPPING_OPTIONS[0];

  const total = subtotal + shipping.price;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (hasUnavailableItems) {
      return;
    }

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    saveCheckoutSession({
      customer: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        village: form.village.trim(),
        district: form.district.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        postalCode: form.postalCode.trim(),
      },

      items: purchasableItems.map((item) => ({
        cartItemKey: item.cartItemKey,
        slug: item.slug,
        sku: item.sku ?? item.id,
        name: item.name,
        price: Number(item.price) || 0,
        image: item.image || '',
        color: item.color || '',
        size: item.size || '',
        quantity: item.quantity,
      })),

      subtotal,
      shippingMethod,

      shipping: {
        method: shippingMethod,
        label: shipping.label,
        description: shipping.description,
        price: shipping.price,
      },

      total,
    });

    // Order belum dibuat di tahap checkout.
    // Checkout hanya menyimpan data sementara.
    navigate('/payment', { replace: true });
  };

  if (!items.length) {
    return <EmptyCheckout />;
  }

  return (
    <main className="bg-background min-h-[100svh] w-full pt-24 pb-12 sm:pt-26 sm:pb-20 lg:pt-30">
      <div className="px-margin-mobile md:px-margin-desktop mx-auto max-w-screen-2xl">
        <header className="mb-10">
          <TextButton
            as={Link}
            to="/cart"
            variant="muted"
            icon="arrow_back"
            iconPosition="left"
            animateIcon
            underline={false}
          >
            BACK TO CART
          </TextButton>

          <h1 className="font-headline-lg-mobile text-primary md:font-headline-display mt-6">
            CHECKOUT
          </h1>

          {hasUnavailableItems && <UnavailableItemsNotice />}
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid grid-cols-1 gap-12 lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            <ContactInformation
              form={form}
              errors={errors}
              setValue={setValue}
              handleBlur={handleBlur}
            />

            <ShippingAddress
              form={form}
              errors={errors}
              setValue={setValue}
              handleBlur={handleBlur}
            />

            <ShippingMethod shippingMethod={shippingMethod} onSelect={setShippingMethod} />

            <section className="border-border-subtle mt-12 border-t pt-6">
              <p className="font-technical-data text-secondary">
                PAYMENT OPTIONS AND FINAL ORDER CONFIRMATION WILL BE AVAILABLE IN THE NEXT STEP.
              </p>
            </section>
          </div>

          <aside className="lg:col-span-5">
            <OrderSummary
              items={items}
              totalItems={totalItems}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
              hasUnavailableItems={hasUnavailableItems}
            />
          </aside>
        </form>
      </div>
    </main>
  );
}
