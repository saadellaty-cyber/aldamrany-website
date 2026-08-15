'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ChevronDown, GripVertical } from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  updateFeaturedProjects,
  updateHomepageSection,
} from '@/app/admin/(dashboard)/homepage/actions';
import { BilingualField, CheckboxField, TextField } from '@/components/admin/fields';
import { ImagePicker } from '@/components/admin/ImagePicker';
import {
  AdminButton,
  FieldGrid,
  FormMessage,
  Panel,
  PanelHeader,
} from '@/components/admin/ui';
import type { ActionResult } from '@/lib/admin/forms';
import { cn } from '@/lib/utils';

export type HomepageSectionValues = {
  key: string;
  label: string;
  hint: string;
  enabled: boolean;
  eyebrowAr: string | null;
  eyebrowEn: string | null;
  titleAr: string | null;
  titleEn: string | null;
  subtitleAr: string | null;
  subtitleEn: string | null;
  bodyAr: string | null;
  bodyEn: string | null;
  primaryCtaLabelAr: string | null;
  primaryCtaLabelEn: string | null;
  primaryCtaHref: string | null;
  secondaryCtaLabelAr: string | null;
  secondaryCtaLabelEn: string | null;
  secondaryCtaHref: string | null;
  image: { id: string; url: string; name: string } | null;
  supportsImage: boolean;
  supportsSecondaryCta: boolean;
};

export type FeaturedCandidate = {
  id: string;
  title: string;
  subtitle: string;
  featured: boolean;
};

const initialState: ActionResult = { ok: true };

export function HomepageEditor({
  sections,
  projects,
}: {
  sections: HomepageSectionValues[];
  projects: FeaturedCandidate[];
}) {
  const [openKey, setOpenKey] = useState<string | null>(sections[0]?.key ?? null);

  return (
    <div className="space-y-6">
      <Panel padded={false}>
        <div className="border-b border-[#e2e1dc] p-5">
          <PanelHeader
            title="Homepage sections"
            description="Each band of the homepage, top to bottom. Empty fields are hidden on the site rather than left blank."
          />
        </div>

        <ul className="divide-y divide-[#eeedea]">
          {sections.map((section) => (
            <li key={section.key}>
              <button
                type="button"
                onClick={() => setOpenKey((current) => (current === section.key ? null : section.key))}
                aria-expanded={openKey === section.key}
                className="flex w-full items-center gap-3 p-4 text-start transition-colors hover:bg-[#faf9f7]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{section.label}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{section.hint}</span>
                </span>

                {!section.enabled ? (
                  <span className="shrink-0 border border-[#d5d4ce] bg-[#f2f1ee] px-2 py-0.5 text-[0.6875rem] text-ink-muted">
                    Hidden
                  </span>
                ) : null}

                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'size-4 shrink-0 text-ink-muted transition-transform',
                    openKey === section.key && 'rotate-180',
                  )}
                />
              </button>

              {openKey === section.key ? (
                <div className="border-t border-[#eeedea] bg-[#faf9f7] p-4">
                  <SectionForm section={section} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </Panel>

      <FeaturedProjectsPanel projects={projects} />
    </div>
  );
}

function SectionForm({ section }: { section: HomepageSectionValues }) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateHomepageSection, initialState);

  useEffect(() => {
    if (state.ok && state.message) router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="key" value={section.key} />

      {state.message ? (
        <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
      ) : null}

      <CheckboxField
        label="Show this section on the homepage"
        name="enabled"
        defaultChecked={section.enabled}
      />

      <BilingualField
        label="Small label above the heading"
        nameAr="eyebrowAr"
        nameEn="eyebrowEn"
        defaultAr={section.eyebrowAr}
        defaultEn={section.eyebrowEn}
      />

      <BilingualField
        label="Heading"
        nameAr="titleAr"
        nameEn="titleEn"
        defaultAr={section.titleAr}
        defaultEn={section.titleEn}
      />

      <BilingualField
        label="Subheading"
        nameAr="subtitleAr"
        nameEn="subtitleEn"
        defaultAr={section.subtitleAr}
        defaultEn={section.subtitleEn}
      />

      <BilingualField
        label="Body text"
        nameAr="bodyAr"
        nameEn="bodyEn"
        defaultAr={section.bodyAr}
        defaultEn={section.bodyEn}
        multiline
        rows={4}
        help="Leave a blank line between paragraphs."
      />

      {section.supportsImage ? (
        <ImagePicker
          name="image"
          label="Section image"
          description="Used as the background of this section."
          initial={section.image}
        />
      ) : null}

      <BilingualField
        label="Button label"
        nameAr="primaryCtaLabelAr"
        nameEn="primaryCtaLabelEn"
        defaultAr={section.primaryCtaLabelAr}
        defaultEn={section.primaryCtaLabelEn}
      />

      <TextField
        label="Button link"
        name="primaryCtaHref"
        dir="ltr"
        defaultValue={section.primaryCtaHref ?? ''}
        placeholder="/projects"
        help="Internal links start with a slash; the language prefix is added automatically."
      />

      {section.supportsSecondaryCta ? (
        <>
          <BilingualField
            label="Second button label"
            nameAr="secondaryCtaLabelAr"
            nameEn="secondaryCtaLabelEn"
            defaultAr={section.secondaryCtaLabelAr}
            defaultEn={section.secondaryCtaLabelEn}
          />
          <TextField
            label="Second button link"
            name="secondaryCtaHref"
            dir="ltr"
            defaultValue={section.secondaryCtaHref ?? ''}
            placeholder="/about"
          />
        </>
      ) : null}

      <SubmitButton label="Save section" />
    </form>
  );
}

function FeaturedProjectsPanel({ projects }: { projects: FeaturedCandidate[] }) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateFeaturedProjects, initialState);
  const [selected, setSelected] = useState<string[]>(
    projects.filter((project) => project.featured).map((project) => project.id),
  );

  useEffect(() => {
    if (state.ok && state.message) router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSelected((current) => {
      const oldIndex = current.indexOf(String(active.id));
      const newIndex = current.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const byId = new Map(projects.map((project) => [project.id, project]));
  const available = projects.filter((project) => !selected.includes(project.id));

  return (
    <Panel className="space-y-5">
      <PanelHeader
        title="Projects on the homepage"
        description="Choose which projects appear in the Our Work section, then drag them into the order you want."
      />

      {state.message ? (
        <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
      ) : null}

      <form action={formAction} className="space-y-5">
        {selected.map((id) => (
          <input key={id} type="hidden" name="featuredIds" value={id} />
        ))}

        {selected.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No projects selected — the Our Work section will be hidden.
          </p>
        ) : (
          <DndContext
            id="featured-projects"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={selected} strategy={verticalListSortingStrategy}>
              <ol className="space-y-2">
                {selected.map((id, index) => {
                  const project = byId.get(id);
                  if (!project) return null;
                  return (
                    <SortableFeatured
                      key={id}
                      id={id}
                      index={index}
                      project={project}
                      onRemove={() =>
                        setSelected((current) => current.filter((value) => value !== id))
                      }
                    />
                  );
                })}
              </ol>
            </SortableContext>
          </DndContext>
        )}

        {available.length > 0 ? (
          <FieldGrid className="md:grid-cols-1">
            <div>
              <p className="mb-2 text-sm font-medium">Add a project</p>
              <ul className="scrollbar-thin max-h-56 space-y-1 overflow-y-auto border border-[#e2e1dc] p-2">
                {available.map((project) => (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => setSelected((current) => [...current, project.id])}
                      className="flex w-full items-center justify-between gap-3 px-2 py-1.5 text-start text-sm transition-colors hover:bg-[#f2f1ee]"
                    >
                      <span className="min-w-0 flex-1 truncate">{project.title}</span>
                      <span className="shrink-0 text-xs text-ink-muted">{project.subtitle}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </FieldGrid>
        ) : null}

        <SubmitButton label="Save selection" />
      </form>
    </Panel>
  );
}

function SortableFeatured({
  id,
  index,
  project,
  onRemove,
}: {
  id: string;
  index: number;
  project: FeaturedCandidate;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 border border-[#e2e1dc] bg-white p-2',
        isDragging && 'z-10 shadow-lg',
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${project.title}`}
        className="inline-flex size-7 shrink-0 cursor-grab items-center justify-center text-ink-muted active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </button>

      <span className="w-6 shrink-0 text-xs tabular-nums text-ink-muted">{index + 1}</span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{project.title}</span>
        <span className="block truncate text-xs text-ink-muted">{project.subtitle}</span>
      </span>

      <AdminButton variant="ghost" onClick={onRemove}>
        Remove
      </AdminButton>
    </li>
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
