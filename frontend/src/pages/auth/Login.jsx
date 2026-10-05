import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getAsset } from '@/utils/assets';

const validateEmail = (email) => {
  if (!email.trim()) {
    return 'Email address is required.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Enter a valid email address.';
  }

  return '';
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }

  return '';
};

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);

      case 'password':
        return validatePassword(value);

      default:
        return '';
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (touched[name]) {
      setErrors((current) => ({
        ...current,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;

    setTouched((current) => ({
      ...current,
      [name]: true,
    }));

    setErrors((current) => ({
      ...current,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const nextErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };

    setErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setIsLoading(true);
    try {
      // Endpoint Djoser untuk membuat JWT token
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/jwt/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Djoser biasanya mengirim pesan error di key 'detail' atau per-field
        throw new Error(data.detail || 'Email atau password salah.');
      }

      // Djoser JWT mengembalikan { access: "<token_access>", refresh: "<token_refresh>" }
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      navigate('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (name) => `
    w-full
    rounded-none
    border-0
    border-b
    bg-transparent
    px-0
    py-3
    font-body-md
    text-primary
    outline-none
    transition-colors
    duration-300
    placeholder:text-text-muted/60
    focus:ring-0
    ${
      errors[name]
        ? 'border-[#B42318] focus:border-[#B42318]'
        : 'border-border-subtle focus:border-primary'
    }
  `;

  return (
    <main className="bg-surface min-h-[100svh] pt-16 md:px-2 md:pt-20 md:pb-2">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1600px] md:min-h-[calc(100svh-4.5rem)]">
        {/* IMAGE PANEL */}

        <div className="relative hidden overflow-hidden lg:block lg:w-[56%]">
          <img
            src={getAsset('model_backpack_4x3.webp')}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/15" />

          <div className="absolute bottom-8 left-8 opacity-50">
            <span className="font-technical-data text-white">GIDORA / SYSTEM</span>
          </div>
        </div>

        {/* FORM PANEL */}

        <div className="flex w-full items-center lg:w-[44%]">
          <div className="px-margin-mobile w-full py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-16 xl:px-16">
            <div className="mx-auto w-full max-w-md">
              {/* HEADER */}

              <div>
                <h1 className="font-headline-lg-mobile text-primary md:font-headline-lg mt-2">
                  SIGN IN
                </h1>

                <p className="font-body-md text-text-muted mt-3 max-w-sm">
                  Access your account and continue exploring the GIDORA system.
                </p>
              </div>

              {/* FORM */}

              <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
                {/* EMAIL */}

                <div>
                  <label htmlFor="email" className="font-label text-text-muted mb-2 block">
                    EMAIL ADDRESS
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={inputClass('email')}
                  />

                  {errors.email && (
                    <div
                      id="email-error"
                      className="font-label mt-2 flex items-center gap-2 text-[#B42318]"
                      role="alert"
                    >
                      <span
                        className="material-symbols-outlined shrink-0 !text-[16px] !leading-none"
                        aria-hidden="true"
                      >
                        error
                      </span>

                      <span className="leading-none">{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* PASSWORD */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="font-label text-text-muted">
                      PASSWORD
                    </label>

                    <button
                      type="button"
                      className="font-label text-text-muted hover:text-primary cursor-pointer transition-colors"
                    >
                      FORGOT?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                      className={`${inputClass('password')} pr-10`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="text-text-muted hover:text-primary absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer p-1 transition-colors"
                    >
                      <span className="material-symbols-outlined !text-[20px]" aria-hidden="true">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>

                  {errors.password && (
                    <div
                      id="email-error"
                      className="font-label mt-2 flex items-center gap-2 text-[#B42318]"
                      role="alert"
                    >
                      <span
                        className="material-symbols-outlined shrink-0 !text-[16px] !leading-none"
                        aria-hidden="true"
                      >
                        error
                      </span>

                      <span className="leading-none">{errors.password}</span>
                    </div>
                  )}
                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="group border-primary bg-primary font-label-caps text-on-primary hover:text-primary flex w-full cursor-pointer items-center justify-center gap-1 border px-6 py-3.5 transition-all duration-300 hover:bg-transparent"
                >
                  SIGN IN
                  <span className="material-symbols-outlined ml-1 !text-[15px] transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </form>

              {/* REGISTER */}

              <div className="border-border-subtle mt-10 border-t pt-6">
                <p className="font-body-md text-text-muted">Don't have an account?</p>

                <Link
                  to="/register"
                  className="group border-primary font-label-caps text-primary hover:border-text-muted hover:text-text-muted mt-3 inline-flex items-center border-b pb-1 transition-colors"
                >
                  CREATE ACCOUNT
                  <span className="material-symbols-outlined ml-1 !text-[15px] transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
