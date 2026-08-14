'use client';

import { useActionState } from 'react';

import { logIn, type LoginState } from '@/app/admin/actions';
import { SubmitButton } from '@/components/form/SubmitButton';
import { TextField } from '@/components/form/Fields';

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<LoginState, FormData>(logIn, {});

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? '/admin'} />

      {state.error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <TextField
        name="email"
        label="Correo"
        type="email"
        inputMode="email"
        autoComplete="username"
        required
      />
      <TextField
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        required
      />

      <SubmitButton>Entrar al panel</SubmitButton>
    </form>
  );
}
