'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ImageIcon, Pencil, Star, Trash2 } from 'lucide-react';
import { MediaBrowserDialog } from '@/components/admin/MediaBrowserDialog';
import { GalleryImageEditor } from '@/components/admin/GalleryImageEditor';
import { AdminButton, EmptyState, FormMessage, Panel, PanelHeader } from '@/components/admin/ui';
import {
  addProjectImages,
  removeProjectImage,
  reorderProjectImages,
  setProjectImageRole,
} from '@/app/admin/(dashboard)/projects/actions';
import { cn } from '@/lib/utils';
import { useTranslateNode } from '@/components/admin/AdminLocaleProvider';

export type GalleryImage = {
  id: string;
  mediaAssetId: string;
  url: string;
  name: string;
  isHero: boolean;
  isCover: boolean;
  focalX: number;
  focalY: number;
  mobileFocalX: number;
  mobileFocalY: number;
  altTextAr: string | null;
  altTextEn: string | null;
  captionAr: string | null;
  captionEn: string | null;
};

/**
 * Gallery manager for a project.
 *
 * Images are ordered by dragging, and the new order is persisted immediately.
 * Hero and cover are roles assigned to existing rows — the same file is never
 * uploaded twice — and each row carries its own crop, alt text and caption.
 */
export function GalleryManager({
  projectId,
  images,
}: {
  projectId: string;
  images: GalleryImage[];
}) {
  const router = useRouter();
  const tr = useTranslateNode();
  const [items, setItems] = useState(images);
  const [browsing, setBrowsing] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Adopt a fresh list from the server (after an upload, removal or refresh)
  // during render rather than in an effect, so the new images paint in the same
  // pass instead of flashing the previous order first.
  const [renderedImages, setRenderedImages] = useState(images);
  if (renderedImages !== images) {
    setRenderedImages(images);
    setItems(images);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Note: DndContext is given an explicit `id` below so the aria ids it
  // generates match between the server render and hydration.
  const persistOrder = (ordered: GalleryImage[]) => {
    const formData = new FormData();
    formData.set('projectId', projectId);
    for (const image of ordered) formData.append('imageIds', image.id);

    startTransition(async () => {
      await reorderProjectImages(formData);
      router.refresh();
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const ordered = arrayMove(items, oldIndex, newIndex);
    setItems(ordered);
    persistOrder(ordered);
  };

  const assignRole = (imageId: string, role: 'hero' | 'cover') => {
    const formData = new FormData();
    formData.set('projectId', projectId);
    formData.set('imageId', imageId);
    formData.set('role', role);

    startTransition(async () => {
      await setProjectImageRole(formData);
      router.refresh();
    });
  };

  const remove = (imageId: string) => {
    const formData = new FormData();
    formData.set('projectId', projectId);
    formData.set('imageId', imageId);

    setItems((current) => current.filter((item) => item.id !== imageId));
    startTransition(async () => {
      await removeProjectImage(formData);
      router.refresh();
    });
  };

  const addFromLibrary = (assetIds: string[]) => {
    const formData = new FormData();
    formData.set('projectId', projectId);
    for (const id of assetIds) formData.append('mediaAssetIds', id);

    startTransition(async () => {
      const result = await addProjectImages({ ok: true }, formData);
      setMessage(
        result.ok
          ? { tone: 'success', text: result.message ?? 'Images added.' }
          : { tone: 'error', text: result.message ?? 'Could not add the images.' },
      );
      router.refresh();
    });
  };

  const editingImage = items.find((item) => item.id === editing) ?? null;

  return (
    <Panel className={cn('space-y-5', isPending && 'opacity-80')}>
      <PanelHeader
        title="Photographs"
        description="Drag to reorder. The hero image opens the project page; the cover is used on cards and listings. Each image keeps its own crop."
        action={
          <AdminButton variant="secondary" onClick={() => setBrowsing(true)}>
            <ImageIcon className="size-4" aria-hidden="true" />
            Add images
          </AdminButton>
        }
      />

      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}

      {items.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="size-7" aria-hidden="true" />}
          title="No photographs yet"
          description="Add images from the library or upload new ones. The first image added becomes the hero automatically."
          action={<AdminButton onClick={() => setBrowsing(true)}>{tr('Add images')}</AdminButton>}
        />
      ) : (
        <DndContext
          id="project-gallery"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((image, index) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  index={index}
                  onEdit={() => setEditing(image.id)}
                  onRemove={() => remove(image.id)}
                  onSetHero={() => assignRole(image.id, 'hero')}
                  onSetCover={() => assignRole(image.id, 'cover')}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {browsing ? (
        <MediaBrowserDialog
          multiple
          title="Add images to this project"
          onClose={() => setBrowsing(false)}
          onConfirm={(assets) => {
            setBrowsing(false);
            addFromLibrary(assets.map((asset) => asset.id));
          }}
        />
      ) : null}

      {editingImage ? (
        <GalleryImageEditor
          projectId={projectId}
          image={editingImage}
          onClose={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}
    </Panel>
  );
}

function SortableImage({
  image,
  index,
  onEdit,
  onRemove,
  onSetHero,
  onSetCover,
}: {
  image: GalleryImage;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  onSetHero: () => void;
  onSetCover: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'border border-[#e2e1dc] bg-white',
        isDragging && 'z-10 opacity-80 shadow-lg',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f2f1ee]">
        {/* eslint-disable-next-line @next/next/no-img-element -- shows the exact stored crop */}
        <img
          src={image.url}
          alt={image.altTextEn ?? image.name}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `${image.focalX}% ${image.focalY}%` }}
        />

        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${image.name}`}
          className="absolute start-1 top-1 inline-flex size-7 cursor-grab items-center justify-center bg-white/90 text-ink active:cursor-grabbing"
        >
          <GripVertical className="size-3.5" aria-hidden="true" />
        </button>

        <span className="absolute end-1 top-1 flex flex-col items-end gap-1">
          {image.isHero ? (
            <span className="bg-ink px-1.5 py-0.5 text-[0.625rem] font-medium text-paper">HERO</span>
          ) : null}
          {image.isCover ? (
            <span className="bg-white px-1.5 py-0.5 text-[0.625rem] font-medium text-ink">
              COVER
            </span>
          ) : null}
        </span>

        <span className="absolute bottom-1 start-1 bg-white/90 px-1.5 py-0.5 text-[0.625rem] tabular-nums text-ink-muted">
          {index + 1}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-t border-[#eeedea] p-1.5">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-1.5 py-1 text-[0.6875rem] transition-colors hover:bg-black/5"
        >
          <Pencil className="size-3" aria-hidden="true" />
          Edit
        </button>

        {!image.isHero ? (
          <button
            type="button"
            onClick={onSetHero}
            className="inline-flex items-center gap-1 px-1.5 py-1 text-[0.6875rem] transition-colors hover:bg-black/5"
          >
            <Star className="size-3" aria-hidden="true" />
            Hero
          </button>
        ) : null}

        {!image.isCover ? (
          <button
            type="button"
            onClick={onSetCover}
            className="inline-flex items-center gap-1 px-1.5 py-1 text-[0.6875rem] transition-colors hover:bg-black/5"
          >
            Cover
          </button>
        ) : null}

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${image.name}`}
          className="ms-auto inline-flex items-center px-1.5 py-1 text-[0.6875rem] text-danger transition-colors hover:bg-danger/10"
        >
          <Trash2 className="size-3" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
