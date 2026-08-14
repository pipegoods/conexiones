'use client';

import { useEffect, useState } from 'react';

const SHORT_FORMAT = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Bogota',
});

function relative(date: Date): { text: string; alarming: boolean } {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);

  let text: string;
  if (minutes < 1) text = 'ahora mismo';
  else if (minutes < 60) text = `hace ${minutes} min`;
  else if (minutes < 1440) text = `hace ${Math.round(minutes / 60)} h`;
  else text = `hace ${Math.round(minutes / 1440)} d`;

  // More than 12 hours without movement is too long during an emergency.
  return { text, alarming: minutes > 720 };
}

/**
 * Relative timestamps tell operators what has been idle for too long.
 *
 * This is a client component because `Date.now()` is impure during server
 * rendering, and the panel can stay open for hours. The server renders an
 * absolute date and the client replaces it without a hydration mismatch.
 */
export function TimeAgo({ value }: { value: Date | string | null }) {
  const date = value ? new Date(value) : null;
  const [rel, setRel] = useState<{ text: string; alarming: boolean } | null>(null);

  const timestamp = date ? date.getTime() : null;

  useEffect(() => {
    if (timestamp == null) return;
    const update = () => setRel(relative(new Date(timestamp)));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [timestamp]);

  if (!date) return null;

  return (
    <time
      dateTime={date.toISOString()}
      className={rel?.alarming ? 'font-semibold text-red-600' : 'text-neutral-500'}
    >
      {rel ? rel.text : SHORT_FORMAT.format(date)}
    </time>
  );
}
