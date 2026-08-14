'use client';

import { useEffect, useState } from 'react';

/** Warns when the browser is offline during form completion. */
export function NetworkStatusBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Sin conexión a internet. Espera a recuperar señal antes de enviar el formulario.
    </div>
  );
}
