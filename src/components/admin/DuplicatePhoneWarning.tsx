import Link from 'next/link';

import { REQUEST_STATUS_META, OFFER_STATUS_META } from '@/lib/catalogs';
import type { DuplicateCase } from '@/lib/duplicates';
import { offerCode, requestCode } from '@/lib/whatsapp';

export function DuplicatePhoneBanner({ cases }: { cases: DuplicateCase[] }) {
  if (cases.length === 0) return null;

  return (
    <div
      role="status"
      className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-950"
    >
      <p className="font-bold">⚠️ Este teléfono ya tiene {cases.length === 1 ? 'un caso abierto' : 'casos abiertos'}</p>
      <ul className="mt-2 space-y-1">
        {cases.map((c) => (
          <li key={`${c.kind}-${c.id}`}>
            <Link
              href={c.kind === 'request' ? `/admin/solicitudes/${c.id}` : `/admin/ofertas/${c.id}`}
              className="font-semibold underline hover:text-amber-800"
            >
              {c.kind === 'request' ? requestCode(c.number) : offerCode(c.number)}
            </Link>
            {' · '}
            {c.kind === 'request'
              ? REQUEST_STATUS_META[c.status as keyof typeof REQUEST_STATUS_META].label
              : OFFER_STATUS_META[c.status as keyof typeof OFFER_STATUS_META].label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DuplicatePhoneChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 ring-1 ring-amber-300">
      ⚠️ Teléfono duplicado
    </span>
  );
}
