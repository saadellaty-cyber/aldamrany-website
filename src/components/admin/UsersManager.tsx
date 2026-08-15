'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Plus } from 'lucide-react';
import {
  createUser,
  resetUserPassword,
  updateUser,
} from '@/app/admin/(dashboard)/users/actions';
import { CheckboxField, SelectField, TextField } from '@/components/admin/fields';
import {
  AdminButton,
  Badge,
  FormMessage,
  Panel,
  PanelHeader,
} from '@/components/admin/ui';
import type { ActionResult } from '@/lib/admin/forms';
import { formatDateTime } from '@/lib/utils';

export type UserRow = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  isSelf: boolean;
};

const initialState: ActionResult = { ok: true };

const ROLE_OPTIONS = [
  { value: 'EDITOR', label: 'Editor — content, projects and media' },
  { value: 'ADMIN', label: 'Administrator — full access, including deletion' },
];

export function UsersManager({ users }: { users: UserRow[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      <Panel padded={false}>
        <div className="border-b border-[#e2e1dc] p-5">
          <PanelHeader
            title="Accounts"
            description="Editors can manage content, projects and media. Administrators can additionally delete records and manage users."
          />
        </div>

        <ul className="divide-y divide-[#eeedea]">
          {users.map((user) => (
            <li key={user.id} className="p-4">
              <UserRowForm user={user} />
            </li>
          ))}
        </ul>
      </Panel>

      {adding ? (
        <Panel className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">New user</h3>
            <AdminButton variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </AdminButton>
          </div>
          <CreateUserForm onCreated={() => setAdding(false)} />
        </Panel>
      ) : (
        <AdminButton onClick={() => setAdding(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add user
        </AdminButton>
      )}
    </div>
  );
}

function UserRowForm({ user }: { user: UserRow }) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateUser, initialState);
  const [resetState, resetAction] = useActionState(resetUserPassword, initialState);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (state.ok && state.message) router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {user.name}
            <Badge tone={user.role === 'ADMIN' ? 'accent' : 'neutral'}>{user.role}</Badge>
            {!user.isActive ? <Badge tone="danger">Disabled</Badge> : null}
            {user.isSelf ? <Badge tone="neutral">You</Badge> : null}
          </p>
          <p className="mt-1 text-xs text-ink-muted" dir="ltr">
            {user.email} · Last sign-in{' '}
            {user.lastLoginAt ? formatDateTime(user.lastLoginAt, 'en') : 'never'}
          </p>
        </div>
      </div>

      {state.message ? (
        <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
      ) : null}

      {!user.isSelf ? (
        <form action={formAction} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="id" value={user.id} />

          <SelectField
            label="Role"
            name="role"
            defaultValue={user.role}
            options={ROLE_OPTIONS}
            className="min-w-56 flex-1"
          />

          <CheckboxField
            label="Account is active"
            name="isActive"
            defaultChecked={user.isActive}
            className="pb-2.5"
          />

          <SubmitButton label="Save" />
        </form>
      ) : (
        <p className="text-xs text-ink-muted">
          You cannot change your own role or disable your own account.
        </p>
      )}

      {resetting ? (
        <form action={resetAction} className="flex flex-wrap items-end gap-3 border-t border-[#eeedea] pt-3">
          <input type="hidden" name="id" value={user.id} />
          <TextField
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="min-w-56 flex-1"
            help={resetState.errors?.password ?? 'At least 12 characters, with a letter and a number.'}
          />
          <SubmitButton label="Set password" />
          <AdminButton variant="ghost" onClick={() => setResetting(false)}>
            Cancel
          </AdminButton>
        </form>
      ) : (
        <AdminButton variant="ghost" onClick={() => setResetting(true)}>
          Reset password
        </AdminButton>
      )}

      {resetState.message ? (
        <FormMessage tone={resetState.ok ? 'success' : 'error'}>{resetState.message}</FormMessage>
      ) : null}
    </div>
  );
}

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const router = useRouter();
  const [state, formAction] = useActionState(createUser, initialState);

  useEffect(() => {
    if (state.ok && state.message) {
      onCreated();
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Name" name="name" required help={state.errors?.name} />
        <TextField
          label="Email"
          name="email"
          type="email"
          dir="ltr"
          required
          help={state.errors?.email}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          help={state.errors?.password ?? 'At least 12 characters, with a letter and a number.'}
        />
        <SelectField label="Role" name="role" defaultValue="EDITOR" options={ROLE_OPTIONS} />
      </div>

      <SubmitButton label="Create user" />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <AdminButton type="submit" disabled={pending}>
      {pending ? 'Saving…' : label}
    </AdminButton>
  );
}
