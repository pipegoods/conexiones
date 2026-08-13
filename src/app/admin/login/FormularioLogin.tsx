'use client';

import { useActionState } from 'react';

import { entrar, type EstadoLogin } from '@/app/admin/acciones';
import { BotonEnviar } from '@/components/formulario/BotonEnviar';
import { CampoTexto } from '@/components/formulario/Campos';

export function FormularioLogin({ siguiente }: { siguiente?: string }) {
  const [estado, accion] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <form action={accion} className="space-y-5">
      <input type="hidden" name="siguiente" value={siguiente ?? '/admin'} />

      {estado.error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {estado.error}
        </div>
      )}

      <CampoTexto
        nombre="email"
        etiqueta="Correo"
        tipo="email"
        inputMode="email"
        autoComplete="username"
        requerido
      />
      <CampoTexto
        nombre="password"
        etiqueta="Contraseña"
        tipo="password"
        autoComplete="current-password"
        requerido
      />

      <BotonEnviar>Entrar al panel</BotonEnviar>
    </form>
  );
}
