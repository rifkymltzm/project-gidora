import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';

const sanitizePhone = (value) => value.replace(/[^\d+\s-]/g, '');

export default function ContactInformation({ form, errors, setValue, handleBlur }) {
  return (
    <section>
      <SectionTitle number="01" title="CONTACT INFORMATION" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField id="fullName" label="FULL NAME" error={errors.fullName}>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={form.fullName}
            onChange={(event) => setValue('fullName', event.target.value)}
            onBlur={() => handleBlur('fullName')}
            error={Boolean(errors.fullName)}
          />
        </FormField>

        <FormField id="email" label="EMAIL ADDRESS" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setValue('email', event.target.value)}
            onBlur={() => handleBlur('email')}
            error={Boolean(errors.email)}
          />
        </FormField>

        <FormField id="phone" label="PHONE NUMBER" error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="081234567890"
            value={form.phone}
            onChange={(event) => setValue('phone', sanitizePhone(event.target.value))}
            onBlur={() => handleBlur('phone')}
            error={Boolean(errors.phone)}
          />
        </FormField>
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
