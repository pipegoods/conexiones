'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({
  children,
  accent = 'pink',
}: {
  children: React.ReactNode;
  accent?: 'pink' | 'green';
}) {
  const { pending } = useFormStatus();

  const gradiente =
    accent === 'green'
      ? 'from-marca-verde-claro to-marca-cian shadow-marca-verde/30'
      : 'from-marca-coral to-marca-rosa shadow-marca-rosa/30';

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-2xl bg-linear-to-r ${gradiente} px-8 py-4 text-base font-extrabold text-white shadow-lg transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70`}
    >
      {pending ? 'Enviando…' : children}
    </button>
  );
}
