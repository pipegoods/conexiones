'use client';

import { useEffect, useId, useRef } from 'react';

/**
 * Primitivas de formulario compartidas por los dos lados de la red.
 *
 * Decisiones de accesibilidad que hay que mantener: cada campo tiene <label>
 * real, el error se anuncia con aria-describedby + role="alert", y los grupos de
 * opciones son <fieldset> con <legend>. Buena parte de la gente que va a llenar
 * esto lo hará desde un celular, en la calle y con afán.
 */

type Base = {
  nombre: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  requerido?: boolean;
};

function Etiqueta({ htmlFor, texto, requerido }: { htmlFor: string; texto: string; requerido?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-bold text-tinta">
      {texto}
      {requerido && (
        <span className="ml-1 text-marca-rosa" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

function Mensajes({ id, ayuda, error }: { id: string; ayuda?: string; error?: string }) {
  return (
    <>
      {ayuda && !error && (
        <p id={`${id}-ayuda`} className="mt-1.5 text-sm text-neutral-500">
          {ayuda}
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

const claseCampo =
  'mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[16px] text-tinta placeholder:text-neutral-400 transition focus:border-marca-morado focus:ring-2 focus:ring-marca-morado/20';

export function CampoTexto({
  nombre,
  etiqueta,
  ayuda,
  error,
  requerido,
  tipo = 'text',
  placeholder,
  defaultValue,
  inputMode,
  autoComplete,
}: Base & {
  tipo?: string;
  placeholder?: string;
  defaultValue?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div>
      <Etiqueta htmlFor={id} texto={etiqueta} requerido={requerido} />
      <input
        id={id}
        name={nombre}
        type={tipo}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined}
        className={`${claseCampo} ${error ? 'border-red-400' : ''}`}
      />
      <Mensajes id={id} ayuda={ayuda} error={error} />
    </div>
  );
}

export function CampoTextarea({
  nombre,
  etiqueta,
  ayuda,
  error,
  requerido,
  placeholder,
  filas = 5,
  defaultValue,
}: Base & { placeholder?: string; filas?: number; defaultValue?: string }) {
  const id = useId();
  return (
    <div>
      <Etiqueta htmlFor={id} texto={etiqueta} requerido={requerido} />
      <textarea
        id={id}
        name={nombre}
        rows={filas}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined}
        className={`${claseCampo} resize-y ${error ? 'border-red-400' : ''}`}
      />
      <Mensajes id={id} ayuda={ayuda} error={error} />
    </div>
  );
}

export function CampoSelect({
  nombre,
  etiqueta,
  ayuda,
  error,
  requerido,
  opciones,
  placeholder = 'Selecciona…',
  defaultValue,
}: Base & {
  opciones: readonly { valor: string; texto: string }[];
  placeholder?: string;
  defaultValue?: string;
}) {
  const id = useId();
  return (
    <div>
      <Etiqueta htmlFor={id} texto={etiqueta} requerido={requerido} />
      <select
        id={id}
        name={nombre}
        defaultValue={defaultValue ?? ''}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined}
        className={`${claseCampo} ${error ? 'border-red-400' : ''}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
      <Mensajes id={id} ayuda={ayuda} error={error} />
    </div>
  );
}

/** Chips seleccionables. `multiple` decide si son checkbox o radio. */
export function GrupoOpciones({
  nombre,
  etiqueta,
  ayuda,
  error,
  requerido,
  opciones,
  multiple = true,
  columnas = 2,
  acento = 'morado',
}: Base & {
  opciones: readonly { valor: string; texto: string; emoji?: string }[];
  multiple?: boolean;
  columnas?: 1 | 2 | 3;
  acento?: 'morado' | 'verde';
}) {
  const id = useId();
  const claseAcento =
    acento === 'verde'
      ? 'has-checked:border-marca-verde has-checked:bg-emerald-50 has-checked:ring-marca-verde/30'
      : 'has-checked:border-marca-morado has-checked:bg-violet-50 has-checked:ring-marca-morado/30';

  const claseColumnas =
    columnas === 1 ? 'grid-cols-1' : columnas === 3 ? 'sm:grid-cols-3 grid-cols-1' : 'sm:grid-cols-2 grid-cols-1';

  return (
    <fieldset aria-describedby={error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined}>
      <legend className="text-sm font-bold text-tinta">
        {etiqueta}
        {requerido && (
          <span className="ml-1 text-marca-rosa" aria-hidden="true">
            *
          </span>
        )}
      </legend>

      <div className={`mt-3 grid gap-2.5 ${claseColumnas}`}>
        {opciones.map((o) => (
          <label
            key={o.valor}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 ring-2 ring-transparent transition hover:border-neutral-300 ${claseAcento}`}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={nombre}
              value={o.valor}
              className="h-4 w-4 shrink-0 accent-marca-morado"
            />
            {o.emoji && <span aria-hidden="true">{o.emoji}</span>}
            <span>{o.texto}</span>
          </label>
        ))}
      </div>

      <Mensajes id={id} ayuda={ayuda} error={error} />
    </fieldset>
  );
}

export function CampoCheckbox({
  nombre,
  etiqueta,
  error,
  defaultChecked,
}: {
  nombre: string;
  etiqueta: React.ReactNode;
  error?: string;
  defaultChecked?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-neutral-700">
        <input
          id={id}
          name={nombre}
          type="checkbox"
          defaultChecked={defaultChecked}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-marca-morado"
        />
        <span>{etiqueta}</span>
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Bloque rojo con el resumen de errores, para no obligar a cazar campo por campo. */
export function ResumenErrores({ errores }: { errores?: Record<string, string> }) {
  const lista = Object.values(errores ?? {});
  const caja = useRef<HTMLDivElement>(null);

  // Los formularios son largos: sin esto, quien envía desde el botón (abajo del
  // todo) se queda mirando una pantalla que no cambió y no sabe qué falló.
  // Dependemos del objeto `errores` y no de su tamaño: cada envío devuelve uno
  // nuevo, así que dos intentos fallidos seguidos con la misma cantidad de
  // errores también vuelven a llamar la atención.
  useEffect(() => {
    if (!errores || Object.keys(errores).length === 0) return;
    caja.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    caja.current?.focus();
  }, [errores]);

  if (lista.length === 0) return null;

  return (
    <div ref={caja} tabIndex={-1} role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <p className="font-bold text-red-800">
        {lista.length === 1 ? 'Falta un dato:' : `Faltan ${lista.length} datos:`}
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700">
        {lista.map((mensaje) => (
          <li key={mensaje}>{mensaje}</li>
        ))}
      </ul>
    </div>
  );
}
