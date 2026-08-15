'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const WHATSAPP_PATH =
  'M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3a3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.9.8 2.3.6 2.8.6a2.6 2.6 0 0 0 1.7-1.2c.2-.4.2-.8.1-.9l-.5-.4Z';

/**
 * Floating WhatsApp entry point. Rendered only when the owner has saved a
 * number in Site Settings and left the floating button enabled; it appears
 * after the visitor has scrolled past the hero.
 */
export function WhatsAppButton({ href }: { href: string }) {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setVisible(window.scrollY > 400);
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('common.chatOnWhatsapp')}
          className="fixed bottom-5 end-5 z-40 inline-flex size-13 items-center justify-center rounded-full bg-ink text-paper shadow-[0_8px_30px_rgba(17,17,17,0.28)] transition-colors duration-300 hover:bg-ink-raised md:bottom-8 md:end-8"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-6">
            <path d={WHATSAPP_PATH} />
          </svg>
        </motion.a>
      ) : null}
    </AnimatePresence>
  );
}

/** Inline WhatsApp link used in the footer and on the contact page. */
export function WhatsAppInlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={WHATSAPP_PATH} />
    </svg>
  );
}
