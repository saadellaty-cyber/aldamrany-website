'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
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
import { ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react';
import {
  deleteResourceItem,
  reorderResourceItems,
  saveResourceItem,
} from '@/app/admin/(dashboard)/content/[resource]/actions';
import {
  BilingualField,
  CheckboxField,
  SelectField,
  TextField,
} from '@/components/admin/fields';
import { ImagePicker } from '@/components/admin/ImagePicker';
import { IconPicker } from '@/components/admin/IconPicker';
import {
  AdminButton,
  EmptyState,
  FormMessage,
  Panel,
  StatusBadge,
} from '@/components/admin/ui';
import type { ResourceRow } from '@/lib/admin/resource-repos';
import type { ResourceField, ResourceSchema } from '@/lib/admin/resource-schemas';
import type { ActionResult } from '@/lib/admin/forms';
import { cn } from '@/lib/utils';

const initialState: ActionResult = { ok: true };

/**
 * Generic list editor driven by a resource schema: reorder by dragging, expand
 * a row to edit it in place, and add new entries from the same screen.
 */
export function ResourceEditor({
  schema,
  rows,
  canDelete,
}: {
  schema: ResourceSchema;
  rows: ResourceRow[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(rows);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [, startTransition] = useTransition();

  // Adopt a fresh server list during render rather than in an effect.
  const [renderedRows, setRenderedRows] = useState(rows);
  if (renderedRows !== rows) {
    setRenderedRows(rows);
    setItems(rows);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const ordered = arrayMove(items, oldIndex, newIndex);
    setItems(ordered);

    const formData = new FormData();
    formData.set('resource', schema.key);
    for (const item of ordered) formData.append('ids', item.id);

    startTransition(async () => {
      await reorderResourceItems(formData);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {schema.note ? <FormMessage tone="info">{schema.note}</FormMessage> : null}

      {items.length === 0 && !adding ? (
        <EmptyState
          title={`No ${schema.title.toLowerCase()} yet`}
          description={schema.description}
          action={<AdminButton onClick={() => setAdding(true)}>Add {schema.singular}</AdminButton>}
        />
      ) : (
        <DndContext
          id={`resource-${schema.key}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  schema={schema}
                  open={openId === item.id}
                  canDelete={canDelete}
                  canDrag={schema.hasOrder}
                  onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
                  onSaved={() => router.refresh()}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {adding ? (
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">New {schema.singular.toLowerCase()}</h3>
            <AdminButton variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </AdminButton>
          </div>
          <ResourceForm
            schema={schema}
            item={null}
            onSaved={() => {
              setAdding(false);
              router.refresh();
            }}
          />
        </Panel>
      ) : items.length > 0 ? (
        <AdminButton onClick={() => setAdding(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add {schema.singular.toLowerCase()}
        </AdminButton>
      ) : null}
    </div>
  );
}

function SortableRow({
  item,
  schema,
  open,
  canDelete,
  canDrag,
  onToggle,
  onSaved,
}: {
  item: ResourceRow;
  schema: ResourceSchema;
  open: boolean;
  canDelete: boolean;
  canDrag: boolean;
  onToggle: () => void;
  onSaved: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !canDrag,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('border border-[#e2e1dc] bg-white', isDragging && 'z-10 shadow-lg')}
    >
      <div className="flex items-center gap-2 p-3">
        {canDrag ? (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${item.title}`}
            className="inline-flex size-7 shrink-0 cursor-grab items-center justify-center text-ink-muted active:cursor-grabbing"
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-start"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{item.title}</span>
            {item.subtitle ? (
              <span className="mt-0.5 block truncate text-xs text-ink-muted" dir="auto">
                {item.subtitle}
              </span>
            ) : null}
          </span>

          {item.status ? <StatusBadge status={item.status} /> : null}

          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 text-ink-muted transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#eeedea] p-4">
          <ResourceForm schema={schema} item={item} onSaved={onSaved} />

          {canDelete ? (
            <form action={deleteResourceItem} className="mt-5 border-t border-[#eeedea] pt-4">
              <input type="hidden" name="resource" value={schema.key} />
              <input type="hidden" name="id" value={item.id} />
              <AdminButton type="submit" variant="danger">
                <Trash2 className="size-3.5" aria-hidden="true" />
                Delete
              </AdminButton>
            </form>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function ResourceForm({
  schema,
  item,
  onSaved,
}: {
  schema: ResourceSchema;
  item: ResourceRow | null;
  onSaved: () => void;
}) {
  const [state, formAction] = useActionState(saveResourceItem, initialState);

  useEffect(() => {
    if (state.ok && state.message) onSaved();
    // Only react to a completed save, not to every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const values = item?.values ?? {};
  const images = item?.images ?? {};

  const stringValue = (name: string) => {
    const value = values[name];
    return value === null || value === undefined ? '' : String(value);
  };

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="resource" value={schema.key} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      {state.message ? (
        <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
      ) : null}

      {schema.fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          stringValue={stringValue}
          values={values}
          image={images[field.name] ?? null}
        />
      ))}

      {schema.hasStatus ? (
        <SelectField
          label="Visibility"
          name="status"
          defaultValue={item?.status ?? 'PUBLISHED'}
          options={[
            { value: 'PUBLISHED', label: 'Published — visible on the website' },
            { value: 'DRAFT', label: 'Draft — hidden from the website' },
          ]}
        />
      ) : null}

      <SaveButton />
    </form>
  );
}

function FieldRenderer({
  field,
  stringValue,
  values,
  image,
}: {
  field: ResourceField;
  stringValue: (name: string) => string;
  values: Record<string, string | number | boolean | null>;
  image: { id: string; url: string; name: string } | null;
}) {
  switch (field.type) {
    case 'bilingualText':
    case 'bilingualTextarea':
      return (
        <BilingualField
          label={field.label}
          nameAr={`${field.name}Ar`}
          nameEn={`${field.name}En`}
          defaultAr={stringValue(`${field.name}Ar`)}
          defaultEn={stringValue(`${field.name}En`)}
          multiline={field.type === 'bilingualTextarea'}
          rows={field.rows ?? 3}
          required={field.required}
          help={field.help}
        />
      );

    case 'textarea':
      return (
        <TextField
          label={field.label}
          name={field.name}
          defaultValue={stringValue(field.name)}
          help={field.help}
          placeholder={field.placeholder}
        />
      );

    case 'number':
      return (
        <TextField
          label={field.label}
          name={field.name}
          type="number"
          defaultValue={stringValue(field.name)}
          required={field.required}
          help={field.help}
        />
      );

    case 'select':
      return (
        <SelectField
          label={field.label}
          name={field.name}
          defaultValue={stringValue(field.name)}
          options={field.options ?? []}
          help={field.help}
        />
      );

    case 'checkbox':
      return (
        <CheckboxField
          label={field.label}
          name={field.name}
          defaultChecked={Boolean(values[field.name])}
          help={field.help}
        />
      );

    case 'image':
      return (
        <ImagePicker
          name={field.name}
          label={field.label}
          description={field.help}
          initial={image}
        />
      );

    case 'icon':
      return (
        <IconPicker
          name={field.name}
          label={field.label}
          description={field.help}
          initial={stringValue(field.name)}
        />
      );

    default:
      return (
        <TextField
          label={field.label}
          name={field.name}
          defaultValue={stringValue(field.name)}
          required={field.required}
          help={field.help}
          placeholder={field.placeholder}
          dir="ltr"
        />
      );
  }
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <AdminButton type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save'}
    </AdminButton>
  );
}
