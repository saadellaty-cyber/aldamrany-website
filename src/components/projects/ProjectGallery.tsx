'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ImageRef } from '@/lib/content/media';
import { cn } from '@/lib/utils';

/**
 * Project gallery with a full-screen lightbox.
 *
 * Desktop gets an editorial grid where every third image runs wide; on narrow
 * screens the same images become a horizontal, snap-scrolling strip. The
 * lightbox supports arrow keys, Escape, on-screen controls and touch swipes,
 * and returns focus to the thumbnail that opened it.
 */
export function ProjectGallery({ images }: { images: ImageRef[] }) {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const isOpen = openIndex !== null;
  const total = images.length;

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + total) % total;
      });
    },
    [total],
  );

  const open = (index: number) => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    setOpenIndex(index);
  };

  // Keyboard control while the lightbox is open.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      } else if (event.key === 'Tab') {
        // Only the close button is focusable inside the dialog; keep focus here.
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close, step]);

  // Lock background scrolling and move focus into the dialog.
  useEffect(() => {
    if (!isOpen) {
      lastFocused.current?.focus?.();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (images.length === 0) return null;

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      {/* Mobile: swipeable strip */}
      <ul className="scrollbar-thin -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 md:hidden">
        {images.map((image, index) => (
          <li key={image.id + index} className="w-[82%] shrink-0 snap-center">
            <GalleryThumb
              image={image}
              index={index}
              onOpen={open}
              label={t('projects.openGallery')}
              sizes="82vw"
              className="aspect-[4/3]"
            />
          </li>
        ))}
      </ul>

      {/* Desktop: editorial grid */}
      <ul className="hidden grid-cols-6 gap-4 md:grid lg:gap-6">
        {images.map((image, index) => {
          const wide = index % 3 === 0;
          return (
            <li key={image.id + index} className={wide ? 'col-span-6' : 'col-span-3'}>
              <GalleryThumb
                image={image}
                index={index}
                onOpen={open}
                  label={t('projects.openGallery')}
                sizes={wide ? '(min-width: 768px) 100vw, 100vw' : '(min-width: 768px) 50vw, 100vw'}
                className={wide ? 'aspect-[16/9]' : 'aspect-[4/3]'}
              />
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {isOpen && active ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('projects.gallery')}
            className="fixed inset-0 z-100 flex flex-col bg-ink/97 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between px-5 py-4 text-paper md:px-8">
              <p className="latin-nums text-sm opacity-70" aria-live="polite">
                {t('projects.imagePosition', { current: openIndex + 1, total })}
              </p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label={t('projects.closeGallery')}
                className="inline-flex size-11 items-center justify-center border border-paper/25 transition-colors hover:bg-paper hover:text-ink"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden px-3 pb-6 md:px-20">
              {total > 1 ? (
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={t('projects.previousImage')}
                  className="absolute start-2 z-10 hidden size-12 items-center justify-center border border-paper/25 text-paper transition-colors hover:bg-paper hover:text-ink md:inline-flex"
                >
                  <ChevronLeft className="size-6 rtl:-scale-x-100" aria-hidden="true" />
                </button>
              ) : null}

              <motion.div
                key={openIndex}
                className="relative h-full w-full"
                drag={total > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_event, info) => {
                  if (info.offset.x < -80) step(1);
                  else if (info.offset.x > 80) step(-1);
                }}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={active.url}
                  alt={active.alt}
                  fill
                  sizes="100vw"
                  priority
                  className="object-contain"
                  draggable={false}
                />
              </motion.div>

              {total > 1 ? (
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={t('projects.nextImage')}
                  className="absolute end-2 z-10 hidden size-12 items-center justify-center border border-paper/25 text-paper transition-colors hover:bg-paper hover:text-ink md:inline-flex"
                >
                  <ChevronRight className="size-6 rtl:-scale-x-100" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            {active.caption ? (
              <p className="px-5 pb-6 text-center text-sm text-paper/70 md:px-20">
                {active.caption}
              </p>
            ) : null}

            {total > 1 ? (
              <div className="flex items-center justify-center gap-3 pb-6 md:hidden">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={t('projects.previousImage')}
                  className="inline-flex size-11 items-center justify-center border border-paper/25 text-paper"
                >
                  <ChevronLeft className="size-5 rtl:-scale-x-100" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={t('projects.nextImage')}
                  className="inline-flex size-11 items-center justify-center border border-paper/25 text-paper"
                >
                  <ChevronRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function GalleryThumb({
  image,
  index,
  onOpen,
  label,
  sizes,
  className,
}: {
  image: ImageRef;
  index: number;
  onOpen: (index: number) => void;
  label: string;
  sizes: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={image.alt ? `${label}: ${image.alt}` : label}
      className={cn('group relative block w-full overflow-hidden bg-paper-soft', className)}
      style={
        {
          '--focal-mobile': image.mobilePosition,
          '--focal-desktop': image.position,
        } as React.CSSProperties
      }
    >
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        placeholder={image.blurDataUrl ? 'blur' : 'empty'}
        blurDataURL={image.blurDataUrl ?? undefined}
        className="object-cover [object-position:var(--focal-mobile)] transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] md:[object-position:var(--focal-desktop)]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10"
      />
    </button>
  );
}
