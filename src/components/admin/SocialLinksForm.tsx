'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateSocialLinks } from '@/app/admin/(dashboard)/settings/actions';
import { TextField } from '@/components/admin/fields';
import { AdminButton, FormMessage, Panel, PanelHeader } from '@/components/admin/ui';
import type { ActionResult } from '@/lib/admin/forms';
import type { SocialPlatform } from '@/generated/prisma/enums';

export type SocialValues = Record<SocialPlatform, string | null>;

const PLATFORMS: Array<{ key: SocialPlatform; label: string; placeholder: string }> = [
  { key: 'FACEBOOK', label: 'Facebook', placeholder: 'https://www.facebook.com/…' },
  { key: 'INSTAGRAM', label: 'Instagram', placeholder: 'https://www.instagram.com/…' },
  { key: 'LINKEDIN', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/company/…' },
  { key: 'YOUTUBE', label: 'YouTube', placeholder: 'https://www.youtube.com/@…' },
  { key: 'TIKTOK', label: 'TikTok', placeholder: 'https://www.tiktok.com/@…' },
  { key: 'X', label: 'X (Twitter)', placeholder: 'https://x.com/…' },
];

const initialState: ActionResult = { ok: true };

export function SocialLinksForm({ values }: { values: SocialValues }) {
  const [state, formAction] = useActionState(updateSocialLinks, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
      ) : null}

      <Panel className="space-y-5">
        <PanelHeader
          title="Profiles"
          description="Links appear in the footer and on the contact page as soon as they are saved."
        />

        <div className="grid gap-5 md:grid-cols-2">
          {PLATFORMS.map((platform) => (
            <TextField
              key={platform.key}
              label={platform.label}
              name={platform.key}
              type="url"
              dir="ltr"
              defaultValue={values[platform.key] ?? ''}
              placeholder={platform.placeholder}
              help={state.errors?.[platform.key]}
            />
          ))}
        </div>
      </Panel>

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <AdminButton type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save links'}
    </AdminButton>
  );
}
