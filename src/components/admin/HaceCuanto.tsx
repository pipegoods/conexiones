'use client';

import { useEffect, useState } from 'react';

const FORMATO_CORTO = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Bogota',
});

function relativo(fecha: Date): { texto: string; alarmante: boolean } {
  const minutos = Math.round((Date.now() - fecha.getTime()) / 60000);

  let texto: string;
  if (minutos < 1) texto = 'ahora mismo';
  else if (minutos < 60) texto = `hace ${minutos} min`;
  else if (minutos < 1440) texto = `hace ${Math.round(minutos / 60)} h`;
  else texto = `hace ${Math.round(minutos / 1440)} d`;

  // Más de 12 horas sin moverse: en una emergencia eso ya es demasiado.
  return { texto, alarmante: minutos > 720 };
}

/**
 * "hace 3 h" — lo que le dice al operador qué lleva demasiado tiempo quieto.
 *
 * Es un componente de cliente por dos razones: `Date.now()` durante el render de
 * un componente de servidor es impuro, y el panel se queda abierto horas, así que
 * el texto tiene que refrescarse solo o miente. El servidor pinta la fecha
 * absoluta y el cliente la reemplaza por el relativo, sin desajuste de hidratación.
 */
export function HaceCuanto({ valor }: { valor: Date | string | null }) {
  const fecha = valor ? new Date(valor) : null;
  const [rel, setRel] = useState<{ texto: string; alarmante: boolean } | null>(null);

  const marca = fecha ? fecha.getTime() : null;

  useEffect(() => {
    if (marca == null) return;
    const actualizar = () => setRel(relativo(new Date(marca)));
    actualizar();
    const id = setInterval(actualizar, 60_000);
    return () => clearInterval(id);
  }, [marca]);

  if (!fecha) return null;

  return (
    <time
      dateTime={fecha.toISOString()}
      className={rel?.alarmante ? 'font-semibold text-red-600' : 'text-neutral-500'}
    >
      {rel ? rel.texto : FORMATO_CORTO.format(fecha)}
    </time>
  );
}
