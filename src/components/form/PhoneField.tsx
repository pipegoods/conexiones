'use client';

import { useId } from 'react';

import { formatPhoneDisplay, normalizePhoneInput } from '@/lib/phone';

type PhoneFieldProps = {
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  defaultValue?: string;
};

const fieldClassName =
  'mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[16px] text-tinta placeholder:text-neutral-400 transition focus:border-marca-morado focus:ring-2 focus:ring-marca-morado/20';

export function PhoneField({
  name = 'phone',
  label = 'Número de WhatsApp',
  hint = 'Usamos WhatsApp para contactarte. Escríbelo con el 3 al inicio.',
  error,
  required = true,
  defaultValue = '',
}: PhoneFieldProps) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-tinta">
        {label}
        {required && (
          <span className="ml-1 text-marca-rosa" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="300 123 4567"
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${fieldClassName} ${error ? 'border-red-400' : ''}`}
        onChange={(event) => {
          event.currentTarget.value = normalizePhoneInput(event.currentTarget.value);
        }}
        onBlur={(event) => {
          event.currentTarget.value = formatPhoneDisplay(event.currentTarget.value);
        }}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
