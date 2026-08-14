import {
  CONNECTION_STATUS_META,
  OFFER_STATUS_META,
  REQUEST_STATUS_META,
  RESOURCES,
  URGENCY_LABELS,
  type ConnectionStatus,
  type OfferStatus,
  type RequestStatus,
  type ResourceType,
  type Urgency,
} from '@/lib/catalogs';

export function RequestBadge({ status }: { status: RequestStatus }) {
  const meta = REQUEST_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1 ${meta.className}`}
      title={meta.description}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      {meta.level >= 0 && <span className="opacity-60">N{meta.level}</span>}
      {meta.label}
    </span>
  );
}

export function OfferBadge({ status }: { status: OfferStatus }) {
  const meta = OFFER_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1 ${meta.className}`}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      {meta.label}
    </span>
  );
}

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const meta = CONNECTION_STATUS_META[status];
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${meta.className}`}>
      {meta.label}
    </span>
  );
}

const URGENCY_CLASSNAMES: Record<Urgency, string> = {
  immediate: 'bg-red-100 text-red-800 ring-red-300',
  today: 'bg-orange-100 text-orange-800 ring-orange-300',
  this_week: 'bg-amber-50 text-amber-800 ring-amber-200',
  not_urgent: 'bg-neutral-100 text-neutral-600 ring-neutral-300',
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1 ${URGENCY_CLASSNAMES[urgency]}`}>
      {URGENCY_LABELS[urgency]}
    </span>
  );
}

export function ResourceChips({
  types,
  side = 'internal',
}: {
  types: readonly ResourceType[];
  side?: 'internal' | 'seeking' | 'offering';
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {types.map((t) => (
        <li
          key={t}
          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
        >
          <span aria-hidden="true">{RESOURCES[t].emoji}</span>
          {RESOURCES[t][side]}
        </li>
      ))}
    </ul>
  );
}

const DATE_FORMAT = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Bogota',
});

export function DateDisplay({ value }: { value: Date | null }) {
  if (!value) return <span className="text-neutral-400">—</span>;
  return (
    <time dateTime={value.toISOString()} title={value.toLocaleString('es-CO')}>
      {DATE_FORMAT.format(value)}
    </time>
  );
}

export { TimeAgo } from './TimeAgo';

export function Card({
  title,
  action,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-neutral-200">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="font-extrabold tracking-tight text-tinta">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
      {children}
    </p>
  );
}


export function DataPoint({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-neutral-400">{label}</dt>
      <dd className="mt-1 text-sm text-neutral-800">{children}</dd>
    </div>
  );
}
