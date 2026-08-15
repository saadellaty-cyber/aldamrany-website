'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signIn, type LoginState } from '@/app/admin/login/actions';
import { TextField } from '@/components/admin/fields';
import { AdminButton, FormMessage } from '@/components/admin/ui';

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={formAction} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        required
        autoFocus
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <AdminButton type="submit" disabled={pending} className="w-full">
      {pending ? 'Signing in…' : 'Sign in'}
    </AdminButton>
  );
}
