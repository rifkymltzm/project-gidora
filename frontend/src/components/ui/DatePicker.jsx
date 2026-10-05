import { useEffect, useMemo, useRef, useState } from 'react';

const WEEK_DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
});

const DISPLAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const ACCESSIBLE_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'full',
});

const MONTHS = Array.from({ length: 12 }, (_, i) => MONTH_FORMATTER.format(new Date(2020, i, 1)));

const pad = (n) => String(n).padStart(2, '0');

const formatDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const parseDate = (value) => {
  if (!value || typeof value !== 'string') return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return null;

  const [, yearString, monthString, dayString] = match;

  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return startOfDay(date);
};

const isSameDate = (a, b) => Boolean(a && b && formatDate(a) === formatDate(b));

const isDateDisabled = (date, min, max) => Boolean((min && date < min) || (max && date > max));

const isMonthDisabled = (year, month, min, max) => {
  const firstDay = startOfDay(new Date(year, month, 1));
  const lastDay = startOfDay(new Date(year, month + 1, 0));

  return Boolean((min && lastDay < min) || (max && firstDay > max));
};

const isYearDisabled = (year, min, max) => {
  const firstDay = startOfDay(new Date(year, 0, 1));
  const lastDay = startOfDay(new Date(year, 11, 31));

  return Boolean((min && lastDay < min) || (max && firstDay > max));
};

const getCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  const days = [];

  for (let i = firstDayOffset - 1; i >= 0; i -= 1) {
    days.push({
      date: startOfDay(new Date(year, month - 1, daysInPreviousMonth - i)),
      currentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({
      date: startOfDay(new Date(year, month, day)),
      currentMonth: true,
    });
  }

  let nextDay = 1;

  while (days.length < 42) {
    days.push({
      date: startOfDay(new Date(year, month + 1, nextDay)),
      currentMonth: false,
    });

    nextDay += 1;
  }

  return days;
};

const getLocalToday = () => startOfDay(new Date());

const getFocusableElements = (container) => {
  if (!container) return [];

  return Array.from(
    container.querySelectorAll(
      [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(','),
    ),
  ).filter(
    (element) =>
      !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
  );
};

export default function DatePicker({
  value = '',
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date',
  label,
  disabled = false,
  error = '',
  id = 'date-picker',
}) {
  const triggerRef = useRef(null);
  const modalRef = useRef(null);
  const calendarRef = useRef(null);

  const today = getLocalToday();

  const parsedValue = parseDate(value);
  const parsedMin = parseDate(minDate);
  const parsedMax = parseDate(maxDate);

  const baseDate = parsedValue || parsedMax || parsedMin || today;

  const [open, setOpen] = useState(false);

  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(baseDate.getFullYear(), baseDate.getMonth(), 1),
  );

  const [focusedDate, setFocusedDate] = useState(baseDate);

  const [view, setView] = useState('calendar');

  const displayStr = parsedValue ? DISPLAY_FORMATTER.format(parsedValue) : '';

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);

  const years = useMemo(() => {
    const start = Math.floor(visibleMonth.getFullYear() / 12) * 12;

    return Array.from({ length: 12 }, (_, index) => start + index);
  }, [visibleMonth]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePicker();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(modalRef.current);

      if (!focusableElements.length) {
        event.preventDefault();
        modalRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const timer = requestAnimationFrame(() => {
      calendarRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(timer);
    };
  }, [open]);

  const closePicker = () => {
    setOpen(false);
    setView('calendar');

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  const openPicker = () => {
    if (disabled) return;

    const nextDate = parsedValue || baseDate;

    setFocusedDate(nextDate);

    setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));

    setView('calendar');
    setOpen(true);
  };

  const handleSelect = (date) => {
    if (isDateDisabled(date, parsedMin, parsedMax)) return;

    onChange?.(formatDate(date));
    closePicker();
  };

  const shiftMonth = (amount) => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1));
  };

  const shiftYear = (amount) => {
    setVisibleMonth(new Date(visibleMonth.getFullYear() + amount, visibleMonth.getMonth(), 1));
  };

  const moveFocus = (amount) => {
    const nextDate = new Date(focusedDate);

    for (let i = 0; i < 3660; i += 1) {
      nextDate.setDate(nextDate.getDate() + amount);

      if (!isDateDisabled(nextDate, parsedMin, parsedMax)) {
        setFocusedDate(nextDate);

        if (
          nextDate.getMonth() !== visibleMonth.getMonth() ||
          nextDate.getFullYear() !== visibleMonth.getFullYear()
        ) {
          setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
        }

        return;
      }
    }
  };

  const handleCalendarKeyDown = (event) => {
    if (view !== 'calendar') return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveFocus(-1);
        break;

      case 'ArrowRight':
        event.preventDefault();
        moveFocus(1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        moveFocus(-7);
        break;

      case 'ArrowDown':
        event.preventDefault();
        moveFocus(7);
        break;

      case 'Home': {
        event.preventDefault();

        const nextDate = new Date(focusedDate);
        const day = (nextDate.getDay() + 6) % 7;

        nextDate.setDate(nextDate.getDate() - day);

        if (!isDateDisabled(nextDate, parsedMin, parsedMax)) {
          setFocusedDate(nextDate);
        }

        break;
      }

      case 'End': {
        event.preventDefault();

        const nextDate = new Date(focusedDate);
        const day = (nextDate.getDay() + 6) % 7;

        nextDate.setDate(nextDate.getDate() + (6 - day));

        if (!isDateDisabled(nextDate, parsedMin, parsedMax)) {
          setFocusedDate(nextDate);
        }

        break;
      }

      case 'Enter':
      case ' ': {
        event.preventDefault();
        handleSelect(focusedDate);
        break;
      }

      default:
        break;
    }
  };

  return (
    <>
      {/* TRIGGER */}
      <div>
        {label && (
          <label htmlFor={id} className={`font-label text-tertiary-container mb-1.5 block`}>
            {label}
          </label>
        )}

        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          onClick={openPicker}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`font-input text-secondary flex w-full items-center justify-between border-b bg-transparent px-0 py-3 text-left transition-colors duration-300 outline-none ${
            error ? 'border-error' : open ? 'border-primary' : 'border-border-subtle'
          } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <span className="text-secondary">{value ? displayStr : placeholder}</span>

          {!disabled && (
            <span
              className="material-symbols-outlined text-secondary !text-[19px]"
              aria-hidden="true"
            >
              calendar_month
            </span>
          )}
        </button>

        {error && (
          <div
            id={`${id}-error`}
            className="font-label text-error mt-2 flex items-center gap-2"
            role="alert"
          >
            <span
              className="material-symbols-outlined shrink-0 !text-[16px] !leading-none"
              aria-hidden="true"
            >
              error
            </span>

            <span className="leading-none">{error}</span>
          </div>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePicker();
            }
          }}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-dialog-title`}
            className="border-border-subtle bg-surface-white flex max-h-[90svh] w-full flex-col overflow-hidden border shadow-[0_24px_60px_rgba(0,0,0,0.14)] outline-none sm:max-w-[420px]"
          >
            {/* HEADER */}
            <div className="border-border-subtle flex items-center justify-between border-b px-5 py-4">
              <div>
                <p id={`${id}-dialog-title`} className="font-label-caps text-tertiary-container">
                  SELECT DATE
                </p>

                <p className="font-technical-data text-secondary mt-1">
                  {value ? displayStr : 'No date selected'}
                </p>
              </div>

              <button
                type="button"
                onClick={closePicker}
                className="text-text-muted hover:bg-surface-container-low hover:text-primary flex h-9 w-9 cursor-pointer items-center justify-center transition-colors"
                aria-label="Close date picker"
              >
                <span className="material-symbols-outlined !text-[20px]" aria-hidden="true">
                  close
                </span>
              </button>
            </div>

            {/* CALENDAR */}
            {view === 'calendar' && (
              <>
                <div
                  ref={calendarRef}
                  tabIndex={0}
                  onKeyDown={handleCalendarKeyDown}
                  className="overflow-y-auto p-4 outline-none sm:p-5"
                  role="grid"
                  aria-label={`${MONTHS[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setView('month')}
                        className="font-technical-data text-primary hover:bg-surface-container-low cursor-pointer px-1.5 py-1"
                        aria-label="Choose month"
                      >
                        {MONTHS[visibleMonth.getMonth()]}
                      </button>

                      <button
                        type="button"
                        onClick={() => setView('year')}
                        className="font-technical-data text-primary hover:bg-surface-container-low cursor-pointer px-1.5 py-1"
                        aria-label="Choose year"
                      >
                        {visibleMonth.getFullYear()}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => shiftMonth(-1)}
                        className="text-text-muted hover:bg-surface-container-low hover:text-primary flex h-9 w-9 cursor-pointer items-center justify-center"
                        aria-label="Previous month"
                      >
                        <span className="material-symbols-outlined !text-[19px]" aria-hidden="true">
                          chevron_left
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => shiftMonth(1)}
                        className="text-text-muted hover:bg-surface-container-low hover:text-primary flex h-9 w-9 cursor-pointer items-center justify-center"
                        aria-label="Next month"
                      >
                        <span className="material-symbols-outlined !text-[19px]" aria-hidden="true">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7" role="row">
                    {WEEK_DAYS.map((day) => (
                      <div
                        key={day}
                        role="columnheader"
                        className="font-label text-text-muted flex h-8 items-center justify-center"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {calendarDays.map(({ date, currentMonth }) => {
                      const selected = isSameDate(date, parsedValue);

                      const isToday = isSameDate(date, today);

                      const focused = isSameDate(date, focusedDate);

                      const disabledDate = isDateDisabled(date, parsedMin, parsedMax);

                      return (
                        <div
                          key={formatDate(date)}
                          role="gridcell"
                          aria-selected={selected}
                          aria-current={isToday ? 'date' : undefined}
                        >
                          <button
                            type="button"
                            disabled={disabledDate}
                            tabIndex={focused ? 0 : -1}
                            onFocus={() => setFocusedDate(date)}
                            onClick={() => handleSelect(date)}
                            aria-label={ACCESSIBLE_DATE_FORMATTER.format(date)}
                            className={`font-technical-data relative flex h-10 w-full cursor-pointer items-center justify-center transition-colors duration-200 outline-none ${
                              selected
                                ? 'bg-primary text-on-primary hover:bg-primary hover:text-on-primary'
                                : !currentMonth
                                  ? 'text-text-muted/40 hover:bg-surface-container-low hover:text-primary'
                                  : disabledDate
                                    ? 'text-text-muted/30 cursor-not-allowed'
                                    : 'text-primary hover:bg-surface-container-low'
                            } ${focused && !selected ? 'ring-primary ring-1 ring-inset' : ''}`}
                          >
                            {date.getDate()}

                            {isToday && !selected && (
                              <span
                                className="bg-primary absolute bottom-1 h-1 w-1 rounded-full"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-border-subtle flex items-center justify-between border-t px-5 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      const month = new Date(today.getFullYear(), today.getMonth(), 1);

                      setVisibleMonth(month);
                      setFocusedDate(
                        isDateDisabled(today, parsedMin, parsedMax) ? baseDate : today,
                      );
                    }}
                    className="font-label-caps text-text-muted hover:text-primary cursor-pointer"
                  >
                    THIS MONTH
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelect(today)}
                    disabled={isDateDisabled(today, parsedMin, parsedMax)}
                    className="font-label-caps text-primary hover:text-text-muted disabled:text-text-muted/40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    TODAY
                  </button>
                </div>
              </>
            )}

            {/* MONTH SELECTOR */}
            {view === 'month' && (
              <div className="overflow-y-auto p-5">
                <div className="mb-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => shiftYear(-1)}
                    className="text-text-muted hover:bg-surface-container-low hover:text-primary flex h-9 w-9 cursor-pointer items-center justify-center"
                    aria-label="Previous year"
                  >
                    <span className="material-symbols-outlined !text-[19px]" aria-hidden="true">
                      chevron_left
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setView('year')}
                    className="font-technical-data text-primary hover:text-text-muted cursor-pointer"
                  >
                    {visibleMonth.getFullYear()}
                  </button>

                  <button
                    type="button"
                    onClick={() => shiftYear(1)}
                    className="text-text-muted hover:bg-surface-container-low hover:text-primary flex h-9 w-9 cursor-pointer items-center justify-center"
                    aria-label="Next year"
                  >
                    <span className="material-symbols-outlined !text-[19px]" aria-hidden="true">
                      chevron_right
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {MONTHS.map((month, index) => {
                    const active = visibleMonth.getMonth() === index;

                    const monthDisabled = isMonthDisabled(
                      visibleMonth.getFullYear(),
                      index,
                      parsedMin,
                      parsedMax,
                    );

                    return (
                      <button
                        key={month}
                        type="button"
                        disabled={monthDisabled}
                        onClick={() => {
                          setVisibleMonth(new Date(visibleMonth.getFullYear(), index, 1));

                          setView('calendar');
                        }}
                        className={`font-technical-data cursor-pointer border px-3 py-3 text-left transition-colors ${
                          monthDisabled
                            ? 'border-border-subtle text-text-muted/30 cursor-not-allowed'
                            : active
                              ? 'border-primary bg-primary text-on-primary'
                              : 'border-border-subtle text-primary hover:bg-surface-container-low'
                        }`}
                      >
                        {month}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* YEAR SELECTOR */}
            {view === 'year' && (
              <div className="overflow-y-auto p-5">
                <div className="mb-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => shiftYear(-12)}
                    className="text-text-muted hover:bg-surface-container-low hover:text-primary flex h-9 w-9 cursor-pointer items-center justify-center"
                    aria-label="Previous years"
                  >
                    <span className="material-symbols-outlined !text-[19px]" aria-hidden="true">
                      chevron_left
                    </span>
                  </button>

                  <span className="font-technical-data text-primary">
                    {years[0]} — {years[years.length - 1]}
                  </span>

                  <button
                    type="button"
                    onClick={() => shiftYear(12)}
                    className="text-text-muted hover:bg-surface-container-low hover:text-primary flex h-9 w-9 cursor-pointer items-center justify-center"
                    aria-label="Next years"
                  >
                    <span className="material-symbols-outlined !text-[19px]" aria-hidden="true">
                      chevron_right
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {years.map((year) => {
                    const active = visibleMonth.getFullYear() === year;

                    const yearDisabled = isYearDisabled(year, parsedMin, parsedMax);

                    return (
                      <button
                        key={year}
                        type="button"
                        disabled={yearDisabled}
                        onClick={() => {
                          setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1));

                          setView('month');
                        }}
                        className={`font-technical-data cursor-pointer border px-3 py-3 transition-colors ${
                          yearDisabled
                            ? 'border-border-subtle text-text-muted/30 cursor-not-allowed'
                            : active
                              ? 'border-primary bg-primary text-on-primary'
                              : 'border-border-subtle text-primary hover:bg-surface-container-low'
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
