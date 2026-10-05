import { useState, useEffect, useRef } from 'react';

import AccountLayout from '@/layouts/AccountLayout';
import Button from '@/components/ui/Button';
import TextButton from '@/components/ui/TextButton';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';

import useForm from '@/hooks/useForm';
import { compose, minLength, phone, postalCode, required } from '@/utils/validators';

const initialAddresses = [
  {
    id: 1,
    label: 'Home',
    recipient: 'Alexander Morgan',
    phone: '+62 812 3456 7890',
    address: 'Jl. Kemang Raya No. 24',
    district: 'Bangka',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12730',
    isDefault: true,
  },
  {
    id: 2,
    label: 'Office',
    recipient: 'Alexander Morgan',
    phone: '+62 812 3456 7890',
    address: 'Jl. Jenderal Sudirman Kav. 52–53',
    district: 'Senayan',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12190',
    isDefault: false,
  },
  {
    id: 3,
    label: 'Other',
    recipient: 'Alexander Morgan',
    phone: '+62 812 3456 7890',
    address: 'Apartemen Senopati Suites Tower B No. 18',
    district: 'Senayan',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12190',
    isDefault: false,
  },
];

const emptyForm = {
  label: 'Home',
  recipient: '',
  phone: '',
  address: '',
  district: '',
  city: '',
  province: '',
  postalCode: '',
  isDefault: false,
};

const labelOptions = ['Home', 'Office', 'Other'];

const validators = {
  recipient: compose(
    required('Recipient name is required.'),
    minLength(2, 'Name must be at least 2 characters.'),
  ),

  phone: compose(required('Phone number is required.'), phone),

  address: required('Address is required.'),

  district: required('District is required.'),

  city: required('City is required.'),

  province: required('Province is required.'),

  postalCode: compose(required('Postal code is required.'), postalCode),
};

const formFields = [
  {
    name: 'recipient',
    label: 'RECIPIENT NAME',
    autoComplete: 'name',
    placeholder: 'Alexander Morgan',
  },
  {
    name: 'phone',
    label: 'PHONE NUMBER',
    type: 'tel',
    autoComplete: 'tel',
    placeholder: '+62 812 3456 7890',
  },
  {
    name: 'address',
    label: 'STREET ADDRESS',
    autoComplete: 'street-address',
    placeholder: 'Street name, building, house number',
    fullWidth: true,
  },
  {
    name: 'district',
    label: 'DISTRICT',
    placeholder: 'District',
  },
  {
    name: 'city',
    label: 'CITY',
    placeholder: 'City',
  },
  {
    name: 'province',
    label: 'PROVINCE',
    placeholder: 'Province',
  },
  {
    name: 'postalCode',
    label: 'POSTAL CODE',
    inputMode: 'numeric',
    maxLength: 5,
    placeholder: '12730',
  },
];

const sanitizeInput = (fieldName, value) => {
  if (fieldName === 'phone') {
    return value.replace(/[^\d+\s-]/g, '');
  }

  if (fieldName === 'postalCode') {
    return value.replace(/\D/g, '');
  }

  return value;
};

export default function UserAddresses() {
  const formRef = useRef(null);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const {
    values: form,
    errors,
    setValue,
    setForm,
    validate,
    resetForm,
    handleBlur,
  } = useForm({
    initialValues: emptyForm,
    validators,
  });

  const isEditing = editingId !== null;

  const closeForm = () => {
    resetForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleAddAddress = () => {
    setForm({
      ...emptyForm,
      isDefault: addresses.length === 0,
    });

    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEditAddress = (address) => {
    setForm({ ...address });
    setEditingId(address.id);
    setIsFormOpen(true);

    setTimeout(() => {
      window.__lenis?.scrollTo(formRef.current, {
        offset: -24,
        duration: 0.6,
      });
    }, 0);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (isEditing) {
      setAddresses((prev) => {
        const currentAddress = prev.find((address) => address.id === editingId);

        const shouldBecomeDefault = form.isDefault || currentAddress?.isDefault;

        return prev.map((address) => {
          if (address.id === editingId) {
            return {
              ...form,
              id: editingId,
              isDefault: shouldBecomeDefault,
            };
          }

          return shouldBecomeDefault ? { ...address, isDefault: false } : address;
        });
      });
    } else {
      const shouldBecomeDefault = form.isDefault || addresses.length === 0;

      const newAddress = {
        ...form,
        id: Date.now(),
        isDefault: shouldBecomeDefault,
      };

      setAddresses((prev) =>
        shouldBecomeDefault
          ? [
              ...prev.map((address) => ({
                ...address,
                isDefault: false,
              })),
              newAddress,
            ]
          : [...prev, newAddress],
      );
    }

    closeForm();
  };

  const handleSetDefault = (id) => {
    setAddresses((prev) =>
      prev.map((address) => ({
        ...address,
        isDefault: address.id === id,
      })),
    );
  };

  const handleDelete = () => {
    if (deleteId === null) {
      return;
    }

    setAddresses((prev) => {
      const deletedAddress = prev.find((address) => address.id === deleteId);

      const remaining = prev.filter((address) => address.id !== deleteId);

      if (remaining.length === 0) {
        return [];
      }

      if (deletedAddress?.isDefault) {
        return remaining.map((address, index) => ({
          ...address,
          isDefault: index === 0,
        }));
      }

      return remaining;
    });

    setDeleteId(null);
  };

  return (
    <AccountLayout
      title="SAVED ADDRESSES"
      description="Manage your shipping addresses for a faster checkout experience."
    >
      <section className="py-6 md:py-10">
        {/* SECTION HEADER */}
        <div className="border-border-subtle flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
          <div>
            <p className="font-label-caps text-tertiary-container">SHIPPING ADDRESSES</p>

            <p className="font-input text-text-muted mt-1 max-w-md sm:mt-1.5">
              You can save multiple addresses and choose a default for checkout.
            </p>
          </div>

          {!isFormOpen && (
            <TextButton
              variant="primary"
              icon="add_location_alt"
              iconPosition="left"
              animateIcon
              animateUnderline
              underlineDirection="right"
              onClick={handleAddAddress}
            >
              ADD NEW ADDRESS
            </TextButton>
          )}
        </div>

        {/* ADDRESS FORM */}
        {isFormOpen && (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="border-border-subtle border-b py-7 sm:py-9"
          >
            {/* FORM HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div>
                <p className="font-label-caps text-tertiary-container">
                  {isEditing ? 'EDIT ADDRESS' : 'NEW ADDRESS'}
                </p>

                <p className="font-body-md text-text-muted mt-1">
                  Enter your shipping information below.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-3 sm:flex-nowrap">
                {labelOptions.map((label) => {
                  const isActive = form.label === label;

                  return (
                    <TextButton
                      key={label}
                      variant={isActive ? 'primary' : 'muted'}
                      underline={isActive}
                      onClick={() => setValue('label', label)}
                    >
                      {label}
                    </TextButton>
                  );
                })}
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="mt-8 grid gap-x-8 gap-y-5 sm:mt-10 sm:gap-y-6 md:grid-cols-2 md:gap-y-7">
              {formFields.map((field) => (
                <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                  <FormField
                    id={`address-${field.name}`}
                    label={field.label}
                    error={errors[field.name]}
                  >
                    <Input
                      id={`address-${field.name}`}
                      name={field.name}
                      type={field.type || 'text'}
                      autoComplete={field.autoComplete}
                      inputMode={field.inputMode}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={(event) => {
                        setValue(field.name, sanitizeInput(field.name, event.target.value));
                      }}
                      onBlur={(event) => handleBlur(field.name, event.target.value)}
                      error={Boolean(errors[field.name])}
                      aria-invalid={Boolean(errors[field.name])}
                      aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                    />
                  </FormField>
                </div>
              ))}
            </div>

            {/* DEFAULT ADDRESS */}
            <label className="mt-7 flex w-fit cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) => setValue('isDefault', event.target.checked)}
                className="accent-primary h-4 w-4 cursor-pointer"
              />

              <span className="font-input text-primary">Set as default shipping address</span>
            </label>

            {/* FORM ACTIONS */}
            <div className="border-border-subtle mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2.5 md:mt-10 md:border-t md:pt-8">
              <Button
                variant="secondary"
                onClick={closeForm}
                className="w-full py-3.5 sm:w-auto sm:px-6 sm:py-3"
              >
                CANCEL
              </Button>

              <Button
                type="submit"
                icon="arrow_forward"
                className="w-full py-3.5 sm:w-auto sm:px-6 sm:py-3"
              >
                {isEditing ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
              </Button>
            </div>
          </form>
        )}

        {/* ADDRESS LIST */}
        <div className="divide-border-subtle divide-y">
          {addresses.length === 0 ? (
            <div className="py-16 text-center sm:py-20">
              <span className="material-symbols-outlined text-text-muted !text-[32px]">
                location_on
              </span>

              <h2 className="font-headline-lg-mobile text-primary mt-4">NO SAVED ADDRESSES</h2>

              <p className="font-body-md text-text-muted mx-auto mt-2 max-w-sm">
                Add your first shipping address to make checkout faster.
              </p>

              <TextButton
                variant="primary"
                icon="arrow_forward"
                animateIcon
                onClick={handleAddAddress}
                className="mt-6"
              >
                ADD ADDRESS
              </TextButton>
            </div>
          ) : (
            addresses.map((address) => (
              <article key={address.id} className="py-6 sm:py-7 md:py-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
                  {/* ADDRESS INFO */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-label-caps text-primary">{address.label}</h2>

                      {address.isDefault && (
                        <span className="border-text-muted font-label-caps text-text-muted border px-2 py-1">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <div className="font-input text-tertiary-container mt-4 max-w-xl space-y-1.5">
                      <p>{address.recipient}</p>
                      <p>{address.phone}</p>

                      <p className="text-text-muted pt-2">{address.address}</p>

                      <p className="text-text-muted">
                        {address.district}, {address.city}
                      </p>

                      <p className="text-text-muted">
                        {address.province} {address.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* ADDRESS ACTIONS */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1 lg:shrink-0 lg:justify-end lg:pt-0">
                    <TextButton
                      variant="muted"
                      icon="edit_location_alt"
                      iconPosition="left"
                      animateUnderline
                      onClick={() => handleEditAddress(address)}
                    >
                      EDIT
                    </TextButton>

                    {!address.isDefault && (
                      <TextButton
                        variant="muted"
                        animateUnderline
                        onClick={() => handleSetDefault(address.id)}
                      >
                        SET DEFAULT
                      </TextButton>
                    )}

                    <TextButton
                      variant="danger"
                      animateUnderline
                      onClick={() => setDeleteId(address.id)}
                    >
                      DELETE
                    </TextButton>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* DELETE CONFIRMATION */}
      {deleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-address-title"
        >
          <div className="bg-surface-white w-full max-w-md p-6 sm:p-8">
            <p className="font-label-caps text-text-muted">REMOVE ADDRESS</p>

            <h2 id="delete-address-title" className="font-headline-lg-mobile text-primary mt-2">
              Remove this address?
            </h2>

            <p className="font-body-md text-text-muted mt-3">
              This address will be permanently removed from your account.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => setDeleteId(null)}
                className="w-full py-3 sm:w-auto sm:px-5"
              >
                CANCEL
              </Button>

              <Button
                variant="danger"
                onClick={handleDelete}
                className="w-full py-3 sm:w-auto sm:px-5"
              >
                REMOVE ADDRESS
              </Button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
