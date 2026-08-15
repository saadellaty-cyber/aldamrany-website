'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ChevronDown, ExternalLink, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  deleteContentBlock,
  saveContentBlock,
  updatePage,
} from '@/app/admin/(dashboard)/pages/actions';
import { BilingualField, CheckboxField, SelectField, TextField } from '@/components/admin/fields';
import { ImagePicker } from '@/components/admin/ImagePicker';
import {
  AdminButton,
  FormMessage,
  Panel,
  StatusBadge,
} from '@/components/admin/ui';
import type { ActionResult } from '@/lib/admin/forms';
import { cn } from '@/lib/utils';

export type PageBlockValues = {
  id: string;
  key: string;
  titleAr: string | null;
  titleEn: string | null;
  bodyAr: string | null;
  bodyEn: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  image: { id: string; url: string; name: string } | null;
};

export type PageValues = {
  key: string;
  label: string;
  path: string;
  hint: string;
  supportsBlocks: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  eyebrowAr: string | null;
  eyebrowEn: string | null;
  titleAr: string | null;
  titleEn: string | null;
  introAr: string | null;
  introEn: string | null;
  seoTitleAr: string | null;
  seoTitleEn: string | null;
  seoDescriptionAr: string | null;
  seoDescriptionEn: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  heroImage: { id: string; url: string; name: string } | null;
  ogImage: { id: string; url: string; name: string } | null;
  blocks: PageBlockValues[];
};

const initialState: ActionResult = { ok: true };

export function PagesEditor({ pages }: { pages: PageValues[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <Panel padded={false}>
      <ul className="divide-y divide-[#eeedea]">
        {pages.map((page) => (
          <li key={page.key}>
            <div className="flex items-center gap-3 p-4">
              <button
                type="button"
                onClick={() => setOpenKey((current) => (current === page.key ? null : page.key))}
                aria-expanded={openKey === page.key}
                className="flex min-w-0 flex-1 items-center gap-3 text-start"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{page.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-ink-muted">{page.hint}</span>
                </span>
                <StatusBadge status={page.status} />
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'size-4 shrink-0 text-ink-muted transition-transform',
                    openKey === page.key && 'rotate-180',
                  )}
                />
              </button>

              <Link
                href={`/ar${page.path}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${page.label} on the website`}
                className="shrink-0 text-ink-muted transition-colors hover:text-ink"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
              </Link>
            </div>

            {openKey === page.key ? (
              <div className="space-y-6 border-t border-[#eeedea] bg-[#faf9f7] p-4">
                <PageForm page={page} />
                {page.supportsBlocks ? <BlocksEditor page={page} /> : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function PageForm({ page }: { page: PageValues }) {
  const router = useRouter();
  const [state, formAction] = useActionState(updatePage, initialState);

  useEffect(() => {
    if (state.ok && state.message) router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="key" value={page.key} />

      {state.message ? (
        <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
      ) : null}

      <BilingualField
        label="Small label above the heading"
        nameAr="eyebrowAr"
        nameEn="eyebrowEn"
        defaultAr={page.eyebrowAr}
        defaultEn={page.eyebrowEn}
      />

      <BilingualField
        label="Page heading"
        nameAr="titleAr"
        nameEn="titleEn"
        defaultAr={page.titleAr}
        defaultEn={page.titleEn}
      />

      <BilingualField
        label="Introduction"
        nameAr="introAr"
        nameEn="introEn"
        defaultAr={page.introAr}
        defaultEn={page.introEn}
        multiline
        rows={4}
      />

      <ImagePicker
        name="heroImage"
        label="Header image"
        description="Full-width image behind the page heading."
        initial={page.heroImage}
      />

      <div className="border-t border-[#e2e1dc] pt-5">
        <p className="mb-4 text-sm font-semibold">Search engines &amp; sharing</p>

        <div className="space-y-5">
          <BilingualField
            label="Page title"
            nameAr="seoTitleAr"
            nameEn="seoTitleEn"
            defaultAr={page.seoTitleAr}
            defaultEn={page.seoTitleEn}
          />

          <BilingualField
            label="Meta description"
            nameAr="seoDescriptionAr"
            nameEn="seoDescriptionEn"
            defaultAr={page.seoDescriptionAr}
            defaultEn={page.seoDescriptionEn}
            multiline
            rows={2}
          />

          <ImagePicker name="ogImage" label="Sharing image" initial={page.ogImage} />

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Canonical URL"
              name="canonicalUrl"
              dir="ltr"
              defaultValue={page.canonicalUrl ?? ''}
            />
            <CheckboxField
              label="Hide this page from search engines"
              name="noIndex"
              defaultChecked={page.noIndex}
            />
          </div>

          <SelectField
            label="Visibility"
            name="status"
            defaultValue={page.status}
            options={[
              { value: 'PUBLISHED', label: 'Published — visible on the website' },
              { value: 'DRAFT', label: 'Draft — hidden from the website' },
            ]}
          />
        </div>
      </div>

      <SubmitButton label="Save page" />
    </form>
  );
}

function BlocksEditor({ page }: { page: PageValues }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="border-t border-[#e2e1dc] pt-5">
      <p className="mb-1 text-sm font-semibold">Content blocks</p>
      <p className="mb-4 text-xs text-ink-muted">
        Additional prose sections on this page — vision, mission, values and similar. Blocks without
        text are hidden on the website.
      </p>

      <ul className="space-y-3">
        {page.blocks.map((block) => (
          <li key={block.id} className="border border-[#e2e1dc] bg-white p-4">
            <BlockForm pageKey={page.key} block={block} />
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="mt-3 border border-[#e2e1dc] bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">New block</p>
            <AdminButton variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </AdminButton>
          </div>
          <BlockForm pageKey={page.key} block={null} onSaved={() => setAdding(false)} />
        </div>
      ) : (
        <AdminButton variant="secondary" className="mt-3" onClick={() => setAdding(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add block
        </AdminButton>
      )}
    </div>
  );
}

function BlockForm({
  pageKey,
  block,
  onSaved,
}: {
  pageKey: string;
  block: PageBlockValues | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveContentBlock, initialState);

  useEffect(() => {
    if (state.ok && state.message) {
      onSaved?.();
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="pageKey" value={pageKey} />
        {block ? <input type="hidden" name="id" value={block.id} /> : null}

        {state.message ? (
          <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
        ) : null}

        <TextField
          label="Reference key"
          name="key"
          dir="ltr"
          defaultValue={block?.key ?? ''}
          placeholder="vision"
          help="Internal identifier, unique within this page."
        />

        <BilingualField
          label="Title"
          nameAr="titleAr"
          nameEn="titleEn"
          defaultAr={block?.titleAr}
          defaultEn={block?.titleEn}
        />

        <BilingualField
          label="Text"
          nameAr="bodyAr"
          nameEn="bodyEn"
          defaultAr={block?.bodyAr}
          defaultEn={block?.bodyEn}
          multiline
          rows={5}
          help="Leave a blank line between paragraphs. For lists such as Values, put one item per line."
        />

        <ImagePicker name="image" label="Image" initial={block?.image ?? null} />

        <SelectField
          label="Visibility"
          name="status"
          defaultValue={block?.status ?? 'PUBLISHED'}
          options={[
            { value: 'PUBLISHED', label: 'Published' },
            { value: 'DRAFT', label: 'Draft — hidden' },
          ]}
        />

        <SubmitButton label="Save block" />
      </form>

      {block ? (
        <form action={deleteContentBlock} className="border-t border-[#eeedea] pt-3">
          <input type="hidden" name="id" value={block.id} />
          <AdminButton type="submit" variant="danger">
            <Trash2 className="size-3.5" aria-hidden="true" />
            Delete block
          </AdminButton>
        </form>
      ) : null}
    </div>
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
