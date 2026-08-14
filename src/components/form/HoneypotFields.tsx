'use client';

import { useState } from 'react';

/** Bot trap and timing token — must stay inside public forms. */
export function HoneypotFields() {
  const [startedAt] = useState(() => Date.now());

  return (
    <>
      <input type="hidden" name="formStartedAt" value={startedAt} readOnly tabIndex={-1} />
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company">Empresa</label>
        <input id="company" name="company" type="text" autoComplete="off" tabIndex={-1} defaultValue="" />
      </div>
    </>
  );
}
