import { useState } from "react";
import { Link } from "react-router-dom";

const images = import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const IMAGE_MAP = Object.fromEntries(
  Object.entries(images).map(([path, image]) => [path.split("/").pop(), image]),
);

const getImage = (filename) => IMAGE_MAP[filename];

const validateName = (name) => {
  const value = name.trim();

  if (!value) {
    return "Full name is required.";
  }

  if (value.length < 2) {
    return "Your name must be at least 2 characters.";
  }

  return "";
};

const validateEmail = (email) => {
  const value = email.trim();

  if (!value) {
    return "Email address is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter a valid email address.";
  }

  return "";
};

const validatePassword = (password) => {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < 8) {
    return "Use at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Add at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Add at least one lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Add at least one number.";
  }

  return "";
};

const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return "Please confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
};

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value, currentForm = form) => {
    switch (name) {
      case "name":
        return validateName(value);

      case "email":
        return validateEmail(value);

      case "password":
        return validatePassword(value);

      case "confirmPassword":
        return validateConfirmPassword(currentForm.password, value);

      default:
        return "";
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    const nextForm = {
      ...form,
      [name]: value,
    };

    setForm(nextForm);

    if (touched[name]) {
      setErrors((current) => ({
        ...current,
        [name]: validateField(name, value, nextForm),
      }));
    }

    // Password berubah → confirm password harus ikut divalidasi.
    if (name === "password" && touched.confirmPassword) {
      setErrors((current) => ({
        ...current,
        confirmPassword: validateConfirmPassword(
          value,
          nextForm.confirmPassword,
        ),
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

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(
        form.password,
        form.confirmPassword,
      ),
    };

    setErrors(nextErrors);

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    // Registration logic nanti di sini.
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
        ? "border-[#B42318] focus:border-[#B42318]"
        : "border-border-subtle focus:border-primary"
    }
  `;

  const renderError = (name, id) => {
    if (!errors[name]) return null;

    return (
      <div
        id={id}
        className="mt-2 flex items-center gap-2 font-label text-[#B42318]"
        role="alert"
      >
        <span
          className="material-symbols-outlined shrink-0 !text-[16px] !leading-none"
          aria-hidden="true"
        >
          error
        </span>

        <span className="leading-none">{errors[name]}</span>
      </div>
    );
  };

  return (
    <main className="min-h-[100svh] bg-surface pt-16 md:pt-20 md:pb-2 md:px-2">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1600px] md:min-h-[calc(100svh-4.5rem)]">
        {/* IMAGE PANEL */}

        <div className="relative hidden overflow-hidden lg:block lg:w-[56%]">
          <img
            src={getImage("model_backpack_4x3.webp")}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/15" />

          <div className="absolute bottom-8 left-8 opacity-50">
            <span className="font-technical-data text-white">
              GIDORA / SYSTEM
            </span>
          </div>
        </div>

        {/* FORM PANEL */}

        <div className="flex w-full items-center lg:w-[44%]">
          <div className="w-full px-margin-mobile py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-16 xl:px-16">
            <div className="mx-auto w-full max-w-md">
              {/* HEADER */}

              <div>
                <h1 className="mt-2 font-headline-lg-mobile text-primary md:font-headline-lg">
                  CREATE ACCOUNT
                </h1>

                <p className="mt-3 max-w-sm font-body-md text-text-muted">
                  Create your GIDORA account and become part of the archive.
                </p>
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
                noValidate
              >
                {/* NAME */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block font-label text-text-muted"
                  >
                    FULL NAME
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={inputClass("name")}
                  />

                  {renderError("name", "name-error")}
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block font-label text-text-muted"
                  >
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
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={inputClass("email")}
                  />

                  {renderError("email", "email-error")}
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block font-label text-text-muted"
                  >
                    PASSWORD
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                      className={`${inputClass("password")} pr-10`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="
                        absolute
                        right-0
                        top-1/2
                        -translate-y-1/2
                        cursor-pointer
                        p-1
                        text-text-muted
                        transition-colors
                        hover:text-primary
                      "
                    >
                      <span
                        className="material-symbols-outlined !text-[20px]"
                        aria-hidden="true"
                      >
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>

                  {renderError("password", "password-error")}
                </div>

                {/* CONFIRM PASSWORD */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block font-label text-text-muted"
                  >
                    CONFIRM PASSWORD
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={
                        errors.confirmPassword
                          ? "confirm-password-error"
                          : undefined
                      }
                      className={`${inputClass("confirmPassword")} pr-10`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      className="
                        absolute
                        right-0
                        top-1/2
                        -translate-y-1/2
                        cursor-pointer
                        p-1
                        text-text-muted
                        transition-colors
                        hover:text-primary
                      "
                    >
                      <span
                        className="material-symbols-outlined !text-[20px]"
                        aria-hidden="true"
                      >
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>

                  {renderError("confirmPassword", "confirm-password-error")}
                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="
                    group
                    mt-2
                    flex
                    w-full
                    cursor-pointer
                    items-center
                    justify-center
                    gap-1
                    border
                    border-primary
                    bg-primary
                    px-6
                    py-3.5
                    font-label-caps
                    text-on-primary
                    transition-all
                    duration-300
                    hover:bg-transparent
                    hover:text-primary
                  "
                >
                  CREATE ACCOUNT
                  <span className="material-symbols-outlined ml-1 !text-[15px] transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </form>

              {/* LOGIN */}

              <div className="mt-10 border-t border-border-subtle pt-6">
                <p className="font-body-md text-text-muted">
                  Already have an account?
                </p>

                <Link
                  to="/login"
                  className="
                    group
                    mt-3
                    inline-flex
                    items-center
                    border-b
                    border-primary
                    pb-1
                    font-label-caps
                    text-primary
                    transition-colors
                    hover:border-text-muted
                    hover:text-text-muted
                  "
                >
                  SIGN IN
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
