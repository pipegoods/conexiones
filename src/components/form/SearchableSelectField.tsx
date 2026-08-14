'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { matchesSearchText } from '@/lib/search-text';

type Option = { value: string; text: string };

type SearchableSelectFieldProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  options: readonly Option[];
  placeholder?: string;
  defaultValue?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onValueChange?: (value: string) => void;
};

const fieldClassName =
  'mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[16px] text-tinta placeholder:text-neutral-400 transition focus:border-marca-morado focus:ring-2 focus:ring-marca-morado/20';

/** Minimum option count before SelectField switches to this searchable combobox. */
export const SEARCHABLE_SELECT_MIN_OPTIONS = 10;

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

export function SearchableSelectField({
  name,
  label,
  hint,
  error,
  required,
  options,
  placeholder = 'Selecciona…',
  defaultValue,
  searchPlaceholder = 'Buscar…',
  emptyMessage = 'No hay resultados.',
  onValueChange,
}: SearchableSelectFieldProps) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [value, setValue] = useState(defaultValue ?? '');
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) => matchesSearchText(option.text, query));
  const highlightedIndex =
    filteredOptions.length === 0 ? 0 : Math.min(activeIndex, filteredOptions.length - 1);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
  }, [open]);

  const describedBy = error ? `${id}-error` : hint ? `${id}-ayuda` : undefined;

  function closeList() {
    setOpen(false);
    setQuery('');
  }

  function selectOption(option: Option) {
    setValue(option.value);
    onValueChange?.(option.value);
    closeList();
  }

  function openList() {
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openList();
    }
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeList();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, filteredOptions.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter' && filteredOptions[highlightedIndex]) {
      event.preventDefault();
      selectOption(filteredOptions[highlightedIndex]);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <FieldLabel htmlFor={id} text={label} required={required} />

      <input type="hidden" name={name} value={value} />

      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-describedby={describedBy}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleTriggerKeyDown}
        className={`${fieldClassName} flex items-center justify-between gap-3 text-left ${error ? 'border-red-400' : ''} ${!selectedOption ? 'text-neutral-400' : ''}`}
      >
        <span className="truncate">{selectedOption?.text ?? placeholder}</span>
        <span aria-hidden="true" className="text-neutral-400">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl shadow-neutral-900/10">
          <div className="border-b border-neutral-100 p-2">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              aria-controls={listboxId}
              aria-autocomplete="list"
              autoComplete="off"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-[16px] text-tinta placeholder:text-neutral-400 focus:border-marca-morado focus:ring-2 focus:ring-marca-morado/20"
            />
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="max-h-60 overflow-y-auto p-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-neutral-500">{emptyMessage}</li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === highlightedIndex;

                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectOption(option)}
                      className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        isActive ? 'bg-violet-50 text-marca-morado' : 'text-tinta hover:bg-neutral-50'
                      } ${isSelected ? 'font-semibold' : 'font-medium'}`}
                    >
                      {option.text}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}
