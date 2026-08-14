/** Strips non-digits while the user types a Colombian mobile number. */
export function normalizePhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  const withoutCountry = digits.startsWith('57') && digits.length > 10 ? digits.slice(2) : digits;
  return withoutCountry.slice(0, 10);
}

/** Formats 10-digit input as "300 123 4567" for readability. */
export function formatPhoneDisplay(value: string): string {
  const digits = normalizePhoneInput(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
