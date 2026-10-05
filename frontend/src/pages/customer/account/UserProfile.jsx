import { useEffect, useRef, useState } from 'react';

import AccountLayout from '@/layouts/AccountLayout';
import DatePicker from '@/components/ui/DatePicker';
import Button from '@/components/ui/Button';
import TextButton from '@/components/ui/TextButton';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

import useForm from '@/hooks/useForm';
import { compose, minLength, phone, required } from '@/utils/validators';

const initialUser = {
  name: 'Alexander Morgan',
  email: 'alexander@example.com',
  phone: '+62 812 3456 7890',
  gender: '',
  birthDate: '1998-08-14',
  avatar: null,
};

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const getLocalDateString = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const isValidDateString = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const validators = {
  name: compose(
    required('Full name is required.'),
    minLength(2, 'Your name must be at least 2 characters.'),
  ),

  phone: compose(required('Phone number is required.'), phone),

  gender: required('Please select your gender.'),

  birthDate: (value) => {
    if (!value) {
      return 'Date of birth is required.';
    }

    if (!isValidDateString(value)) {
      return 'Enter a valid date of birth.';
    }

    if (value > getLocalDateString()) {
      return 'Enter a valid date of birth.';
    }

    return '';
  },
};

const sanitizePhone = (value) => value.replace(/[^\d+\s-]/g, '');

export default function UserProfile() {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef(null);
  const avatarUrlRef = useRef(null);

  const {
    values: form,
    errors,
    setValue,
    setForm,
    validate,
    resetForm,
    handleBlur,
  } = useForm({
    initialValues: initialUser,
    validators,
  });

  useEffect(() => {
    return () => {
      if (avatarUrlRef.current) {
        URL.revokeObjectURL(avatarUrlRef.current);
      }
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setUser({ ...form });
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm(user);
    setIsEditing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = () => {
    setForm(user);
    setIsEditing(true);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (avatarUrlRef.current) {
      URL.revokeObjectURL(avatarUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);

    avatarUrlRef.current = previewUrl;

    setValue('avatar', previewUrl);
  };

  return (
    <AccountLayout
      title="USER PROFILE"
      description="Manage your personal information and account details."
    >
      {/* PROFILE SECTION */}
      <section className="py-6 md:py-10">
        <div className="border-border-subtle flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-center sm:justify-between sm:pb-8 md:pb-9">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="bg-surface-container relative h-16 w-16 shrink-0 overflow-hidden rounded-full sm:h-20 sm:w-20">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt={`${form.name} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="bg-primary font-headline-lg-mobile text-on-primary flex h-full w-full items-center justify-center">
                  {form.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="font-headline-lg-mobile text-primary truncate">{form.name}</h2>

              <p className="font-body-md text-text-muted mt-1 truncate">{form.email}</p>

              <p className="font-technical-data text-text-muted mt-1">MEMBER SINCE 2026</p>
            </div>
          </div>

          {isEditing && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />

              <TextButton
                icon="add_a_photo"
                iconPosition="right"
                animateIcon
                underline={false}
                onClick={() => fileInputRef.current?.click()}
              >
                CHANGE PHOTO
              </TextButton>
            </>
          )}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="mt-7 sm:mt-8" noValidate>
          {/* FORM HEADER */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-2">
            <div>
              <p className="font-label-caps text-tertiary-container">PERSONAL INFORMATION</p>

              <p className="font-technical-data text-text-muted mt-1.5">
                Keep your account information up to date.
              </p>
            </div>

            {!isEditing && (
              <TextButton
                variant="primary"
                icon="person_edit"
                iconPosition="left"
                animateUnderline
                underlineDirection="right"
                onClick={handleEdit}
                className="mt-2 sm:mt-0"
              >
                EDIT PROFILE
              </TextButton>
            )}
          </div>

          {/* FORM FIELDS */}
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-8 sm:mt-10 sm:gap-y-6 md:grid-cols-2 md:gap-y-9">
            {/* FULL NAME */}
            <FormField id="name" label="FULL NAME" error={errors.name}>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(event) => setValue('name', event.target.value)}
                onBlur={(event) => handleBlur('name', event.target.value)}
                disabled={!isEditing}
                error={Boolean(errors.name)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
            </FormField>

            {/* EMAIL */}
            <FormField
              id="email"
              label="EMAIL ADDRESS"
              hint={isEditing ? 'Email address cannot be changed here.' : undefined}
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                disabled
              />
            </FormField>

            {/* PHONE */}
            <FormField id="phone" label="PHONE NUMBER" error={errors.phone}>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+62 812 3456 7890"
                value={form.phone}
                onChange={(event) => {
                  setValue('phone', sanitizePhone(event.target.value));
                }}
                onBlur={(event) => handleBlur('phone', event.target.value)}
                disabled={!isEditing}
                error={Boolean(errors.phone)}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
            </FormField>

            {/* GENDER */}
            <FormField id="gender" label="GENDER" error={errors.gender}>
              <Select
                id="gender"
                value={form.gender}
                options={genderOptions}
                onChange={(value) => setValue('gender', value)}
                disabled={!isEditing}
                placeholder="SELECT GENDER"
                error={Boolean(errors.gender)}
                aria-invalid={Boolean(errors.gender)}
                aria-describedby={errors.gender ? 'gender-error' : undefined}
              />
            </FormField>

            {/* DATE OF BIRTH */}
            <DatePicker
              id="birthDate"
              label="DATE OF BIRTH"
              value={form.birthDate}
              onChange={(value) => setValue('birthDate', value)}
              maxDate={getLocalDateString()}
              disabled={!isEditing}
              error={errors.birthDate}
            />
          </div>

          {/* ACTIONS */}
          {isEditing && (
            <div className="border-border-subtle mt-12 flex flex-col-reverse gap-3 border-t pt-8 sm:mt-10 sm:flex-row sm:justify-end sm:gap-2.5 sm:pt-7 md:mt-12">
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="w-full py-3.5 sm:w-auto sm:px-6 sm:py-3"
              >
                CANCEL
              </Button>

              <Button
                type="submit"
                icon="arrow_forward"
                className="w-full py-3.5 sm:w-auto sm:px-6 sm:py-3"
              >
                SAVE CHANGES
              </Button>
            </div>
          )}
        </form>
      </section>

      {/* ACCOUNT SECURITY */}
      <section className="py-6 md:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-label-caps text-text-muted">ACCOUNT SECURITY</p>

            <p className="font-body-md text-text-muted mt-1 max-w-md sm:mt-1.5">
              Manage your password and account security settings.
            </p>
          </div>

          <TextButton
            icon="encrypted"
            iconPosition="left"
            animateUnderline
            underlineDirection="right"
          >
            CHANGE PASSWORD
          </TextButton>
        </div>
      </section>
    </AccountLayout>
  );
}
