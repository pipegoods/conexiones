'use client';

import { useEffect, useId, useRef } from 'react';

import { SearchableSelectField, SEARCHABLE_SELECT_MIN_OPTIONS } from '@/components/form/SearchableSelectField';

/**
 * Shared form primitives for both sides of the network.
 *
 * Accessibility decisions to preserve: every field has a real <label>, errors
 * are announced through aria-describedby plus role="alert", and option groups
 * use <fieldset> with <legend>. Many people will complete these forms on a
 * phone, outside, and under time pressure.
 */

type Base = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
};

function FieldLabel({ htmlFor, text, required }: { htmlFor: string; text: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-bold text-tinta">
      {text}
      {required && (
        <span className="ml-1 text-marca-rosa" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

function FieldMessages({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint && !error && (
        <p id={`${id}-ayuda`} className="mt-1.5 text-sm text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </>
  );
}

const fieldClassName =
  'mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[16px] text-tinta placeholder:text-neutral-400 transition focus:border-marca-morado focus:ring-2 focus:ring-marca-morado/20';

export function TextField({
  name,
  label,
  hint,
  error,
  required,
  type = 'text',
  placeholder,
  defaultValue,
  inputMode,
  autoComplete,
}: Base & {
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div>
      <FieldLabel htmlFor={id} text={label} required={required} />
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-ayuda` : undefined}
        className={`${fieldClassName} ${error ? 'border-red-400' : ''}`}
      />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

export function TextareaField({
  name,
  label,
  hint,
  error,
  required,
  placeholder,
  rows = 5,
  defaultValue,
}: Base & { placeholder?: string; rows?: number; defaultValue?: string }) {
  const id = useId();
  return (
    <div>
      <FieldLabel htmlFor={id} text={label} required={required} />
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-ayuda` : undefined}
        className={`${fieldClassName} resize-y ${error ? 'border-red-400' : ''}`}
      />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  hint,
  error,
  required,
  options,
  placeholder = 'Selecciona…',
  defaultValue,
  searchable,
  searchPlaceholder,
  onValueChange,
}: Base & {
  options: readonly { value: string; text: string }[];
  placeholder?: string;
  defaultValue?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onValueChange?: (value: string) => void;
}) {
  const id = useId();
  const useSearchable = searchable ?? options.length >= SEARCHABLE_SELECT_MIN_OPTIONS;

  if (useSearchable) {
    return (
      <SearchableSelectField
        name={name}
        label={label}
        hint={hint}
        error={error}
        required={required}
        options={options}
        placeholder={placeholder}
        defaultValue={defaultValue}
        searchPlaceholder={searchPlaceholder}
        onValueChange={onValueChange}
      />
    );
  }

  const includesEmptyOption = options.some((option) => option.value === '');

  return (
    <div>
      <FieldLabel htmlFor={id} text={label} required={required} />
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ''}
        onChange={(event) => onValueChange?.(event.currentTarget.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-ayuda` : undefined}
        className={`${fieldClassName} ${error ? 'border-red-400' : ''}`}
      >
        {!includesEmptyOption && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.text}
          </option>
        ))}
      </select>
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

/** Selectable chips. `multiple` determines whether they are checkboxes or radios. */
export function OptionGroup({
  name,
  label,
  hint,
  error,
  required,
  options,
  multiple = true,
  columns = 2,
  accent = 'purple',
}: Base & {
  options: readonly { value: string; text: string; emoji?: string }[];
  multiple?: boolean;
  columns?: 1 | 2 | 3;
  accent?: 'purple' | 'green';
}) {
  const id = useId();
  const accentClassName =
    accent === 'green'
      ? 'has-checked:border-marca-verde has-checked:bg-emerald-50 has-checked:ring-marca-verde/30'
      : 'has-checked:border-marca-morado has-checked:bg-violet-50 has-checked:ring-marca-morado/30';

  const columnsClassName =
    columns === 1 ? 'grid-cols-1' : columns === 3 ? 'sm:grid-cols-3 grid-cols-1' : 'sm:grid-cols-2 grid-cols-1';

  return (
    <fieldset aria-describedby={error ? `${id}-error` : hint ? `${id}-ayuda` : undefined}>
      <legend className="text-sm font-bold text-tinta">
        {label}
        {required && (
          <span className="ml-1 text-marca-rosa" aria-hidden="true">
            *
          </span>
        )}
      </legend>

      <div className={`mt-3 grid gap-2.5 ${columnsClassName}`}>
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 ring-2 ring-transparent transition hover:border-neutral-300 ${accentClassName}`}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={o.value}
              className="h-4 w-4 shrink-0 accent-marca-morado"
            />
            {o.emoji && <span aria-hidden="true">{o.emoji}</span>}
            <span>{o.text}</span>
          </label>
        ))}
      </div>

      <FieldMessages id={id} hint={hint} error={error} />
    </fieldset>
  );
}

export function CheckboxField({
  name,
  label,
  error,
  defaultChecked,
}: {
  name: string;
  label: React.ReactNode;
  error?: string;
  defaultChecked?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-neutral-700">
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-marca-morado"
        />
        <span>{label}</span>
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Red error summary block so users do not need to find each invalid field. */
export function ErrorSummary({ errors }: { errors?: Record<string, string> }) {
  const list = Object.values(errors ?? {});
  const box = useRef<HTMLDivElement>(null);

  // Forms are long. Without this, someone submitting from the bottom sees no
  // visible change. Depend on the `errors` object rather than its size because
  // every submission returns a new object, including consecutive equal failures.
  useEffect(() => {
    if (!errors || Object.keys(errors).length === 0) return;
    box.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    box.current?.focus();
  }, [errors]);

  if (list.length === 0) return null;

  return (
    <div ref={box} tabIndex={-1} role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <p className="font-bold text-red-800">
        {list.length === 1 ? 'Falta un dato:' : `Faltan ${list.length} datos:`}
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700">
        {list.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
