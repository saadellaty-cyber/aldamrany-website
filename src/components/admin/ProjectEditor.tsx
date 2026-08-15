'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ExternalLink } from 'lucide-react';
import { createProject, updateProject } from '@/app/admin/(dashboard)/projects/actions';
import {
  BilingualField,
  CheckboxField,
  SelectField,
  TextField,
} from '@/components/admin/fields';
import { ImagePicker } from '@/components/admin/ImagePicker';
import {
  AdminButton,
  FieldGrid,
  FormMessage,
  Panel,
  PanelHeader,
} from '@/components/admin/ui';
import type { ActionResult } from '@/lib/admin/forms';

export type ProjectFormValues = {
  id?: string;
  titleAr: string;
  titleEn: string;
  slugAr: string;
  slugEn: string;
  shortDescriptionAr: string | null;
  shortDescriptionEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  locationAr: string | null;
  locationEn: string | null;
  clientAr: string | null;
  clientEn: string | null;
  scopeAr: string | null;
  scopeEn: string | null;
  year: number | null;
  status: string | null;
  governorateId: string | null;
  sectorId: string | null;
  collectionId: string | null;
  featured: boolean;
  featuredOrder: number | null;
  publishStatus: 'DRAFT' | 'PUBLISHED';
  seoTitleAr: string | null;
  seoTitleEn: string | null;
  seoDescriptionAr: string | null;
  seoDescriptionEn: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  ogImage: { id: string; url: string; name: string } | null;
  relatedProjectIds: string[];
};

type Option = { value: string; label: string };

const initialState: ActionResult = { ok: true };

/**
 * Create / edit form for a project.
 *
 * Draft and Publish are two submit buttons on the same form, so the copy being
 * previewed is always exactly the copy that gets published.
 */
export function ProjectEditor({
  mode,
  values,
  sectors,
  governorates,
  collections,
  otherProjects,
  previewUrl,
  publicUrl,
}: {
  mode: 'create' | 'edit';
  values: ProjectFormValues;
  sectors: Option[];
  governorates: Option[];
  collections: Option[];
  otherProjects: Option[];
  previewUrl?: string;
  publicUrl?: string;
}) {
  const action = mode === 'create' ? createProject : updateProject;
  const [state, formAction] = useActionState(action, initialState);
  const [related, setRelated] = useState<string[]>(values.relatedProjectIds);

  const error = (field: string) => state.errors?.[field];

  return (
    <form action={formAction} className="space-y-6 pb-24">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

      {state.message ? (
        <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
      ) : null}

      {/* --- Identity --- */}
      <Panel className="space-y-5">
        <PanelHeader
          title="Project name"
          description="The name shown on the website. Fill in both languages where you can — if one is missing, the other is used."
        />

        <BilingualField
          label="Project name"
          nameAr="titleAr"
          nameEn="titleEn"
          defaultAr={values.titleAr}
          defaultEn={values.titleEn}
        />
        {error('titleAr') ? <p className="text-xs text-danger">{error('titleAr')}</p> : null}

        <FieldGrid>
          <TextField
            label="Arabic URL"
            name="slugAr"
            dir="ltr"
            defaultValue={values.slugAr}
            placeholder="Generated from the Arabic name"
            help="Leave empty to generate automatically."
          />
          <TextField
            label="English URL"
            name="slugEn"
            dir="ltr"
            defaultValue={values.slugEn}
            placeholder="Generated from the English name"
            help="Leave empty to generate automatically."
          />
        </FieldGrid>
      </Panel>

      {/* --- Description --- */}
      <Panel className="space-y-5">
        <PanelHeader
          title="Description"
          description="Leave anything you do not know empty — the website hides empty fields rather than showing placeholder text."
        />

        <BilingualField
          label="Short summary"
          nameAr="shortDescriptionAr"
          nameEn="shortDescriptionEn"
          defaultAr={values.shortDescriptionAr}
          defaultEn={values.shortDescriptionEn}
          multiline
          rows={2}
          help="One or two lines, shown on project cards."
        />

        <BilingualField
          label="Full description"
          nameAr="descriptionAr"
          nameEn="descriptionEn"
          defaultAr={values.descriptionAr}
          defaultEn={values.descriptionEn}
          multiline
          rows={7}
          help="Leave a blank line between paragraphs."
        />

        <BilingualField
          label="Scope of work"
          nameAr="scopeAr"
          nameEn="scopeEn"
          defaultAr={values.scopeAr}
          defaultEn={values.scopeEn}
          multiline
          rows={4}
        />
      </Panel>

      {/* --- Facts --- */}
      <Panel className="space-y-5">
        <PanelHeader title="Project details" description="Shown as a fact list on the project page." />

        <BilingualField
          label="Location"
          nameAr="locationAr"
          nameEn="locationEn"
          defaultAr={values.locationAr}
          defaultEn={values.locationEn}
        />

        <BilingualField
          label="Client"
          nameAr="clientAr"
          nameEn="clientEn"
          defaultAr={values.clientAr}
          defaultEn={values.clientEn}
        />

        <FieldGrid className="md:grid-cols-3">
          <TextField
            label="Year"
            name="year"
            type="number"
            min={1900}
            max={2100}
            defaultValue={values.year ?? ''}
            help={error('year')}
          />
          <SelectField
            label="Status"
            name="status"
            defaultValue={values.status ?? ''}
            placeholder="Not specified"
            options={[
              { value: 'PLANNED', label: 'Planned' },
              { value: 'ONGOING', label: 'Ongoing' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
          <SelectField
            label="Sector"
            name="sectorId"
            defaultValue={values.sectorId ?? ''}
            placeholder="Not specified"
            options={sectors}
          />
          <SelectField
            label="Governorate"
            name="governorateId"
            defaultValue={values.governorateId ?? ''}
            placeholder="Not specified"
            options={governorates}
          />
          <SelectField
            label="Collection"
            name="collectionId"
            defaultValue={values.collectionId ?? ''}
            placeholder="None"
            options={collections}
            help="Group several projects under one umbrella."
          />
        </FieldGrid>
      </Panel>

      {/* --- Homepage --- */}
      <Panel className="space-y-5">
        <PanelHeader
          title="Homepage"
          description="Featured projects appear in the Our Work section of the homepage, in the order set below."
        />
        <FieldGrid>
          <CheckboxField
            label="Show this project on the homepage"
            name="featured"
            defaultChecked={values.featured}
          />
          <TextField
            label="Order on the homepage"
            name="featuredOrder"
            type="number"
            min={0}
            defaultValue={values.featuredOrder ?? ''}
            help="Lower numbers appear first."
          />
        </FieldGrid>
      </Panel>

      {/* --- Related --- */}
      {otherProjects.length > 0 ? (
        <Panel className="space-y-4">
          <PanelHeader
            title="Related projects"
            description="Optional. Leave empty to let the website choose automatically, based on sector, governorate and collection."
          />
          {related.map((id) => (
            <input key={id} type="hidden" name="relatedProjectIds" value={id} />
          ))}
          <ul className="grid gap-2 sm:grid-cols-2">
            {otherProjects.map((project) => {
              const checked = related.includes(project.value);
              return (
                <li key={project.value}>
                  <label className="flex items-start gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        setRelated((current) =>
                          event.target.checked
                            ? [...current, project.value]
                            : current.filter((id) => id !== project.value),
                        )
                      }
                      className="mt-0.5 size-4 accent-[var(--color-ink)]"
                    />
                    <span>{project.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </Panel>
      ) : null}

      {/* --- SEO --- */}
      <Panel className="space-y-5">
        <PanelHeader
          title="Search engines & sharing"
          description="Optional. When empty, the project name and summary are used."
        />

        <BilingualField
          label="Page title"
          nameAr="seoTitleAr"
          nameEn="seoTitleEn"
          defaultAr={values.seoTitleAr}
          defaultEn={values.seoTitleEn}
        />

        <BilingualField
          label="Meta description"
          nameAr="seoDescriptionAr"
          nameEn="seoDescriptionEn"
          defaultAr={values.seoDescriptionAr}
          defaultEn={values.seoDescriptionEn}
          multiline
          rows={2}
        />

        <ImagePicker
          name="ogImageId"
          label="Sharing image"
          description="Used when the project link is shared on social media. Defaults to the site-wide image."
          initial={values.ogImage}
        />

        <FieldGrid>
          <TextField
            label="Canonical URL"
            name="canonicalUrl"
            dir="ltr"
            defaultValue={values.canonicalUrl ?? ''}
            placeholder="Leave empty unless this page exists elsewhere"
          />
          <CheckboxField
            label="Hide this project from search engines"
            name="noIndex"
            defaultChecked={values.noIndex}
          />
        </FieldGrid>
      </Panel>

      <ActionBar
        mode={mode}
        currentStatus={values.publishStatus}
        previewUrl={previewUrl}
        publicUrl={publicUrl}
      />
    </form>
  );
}

function ActionBar({
  mode,
  currentStatus,
  previewUrl,
  publicUrl,
}: {
  mode: 'create' | 'edit';
  currentStatus: 'DRAFT' | 'PUBLISHED';
  previewUrl?: string;
  publicUrl?: string;
}) {
  const { pending } = useFormStatus();
  const isPublished = currentStatus === 'PUBLISHED';

  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-[#e2e1dc] bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          {mode === 'edit' && previewUrl ? (
            <Link
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Preview draft
            </Link>
          ) : null}
          {mode === 'edit' && isPublished && publicUrl ? (
            <Link
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              View live page
            </Link>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AdminButton
            type="submit"
            name="publishStatus"
            value="DRAFT"
            variant="secondary"
            disabled={pending}
          >
            {pending ? 'Saving…' : isPublished ? 'Unpublish & save draft' : 'Save draft'}
          </AdminButton>

          <AdminButton type="submit" name="publishStatus" value="PUBLISHED" disabled={pending}>
            {pending ? 'Saving…' : isPublished ? 'Save & keep published' : 'Publish'}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
