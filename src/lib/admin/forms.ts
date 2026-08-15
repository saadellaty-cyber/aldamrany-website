import { prisma } from '@/lib/db';
import type { SessionUser } from '@/lib/auth/guard';

/** Uniform result shape returned by every dashboard server action. */
export type ActionResult = {
  ok: boolean;
  message?: string;
  /** Field-level messages keyed by input name. */
  errors?: Record<string, string>;
  /** Identifier of the record that was created, for redirects. */
  id?: string;
};

export const ok = (message?: string, id?: string): ActionResult => ({ ok: true, message, id });
export const fail = (message: string, errors?: Record<string, string>): ActionResult => ({
  ok: false,
  message,
  errors,
});

/* --- FormData readers ---------------------------------------------------- */

/** Trimmed string, or '' when absent. */
export function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

/** Trimmed string, or null when empty — matches nullable database columns. */
export function optionalText(formData: FormData, name: string): string | null {
  const value = text(formData, name);
  return value === '' ? null : value;
}

export function integer(formData: FormData, name: string): number | null {
  const value = text(formData, name);
  if (value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function decimal(formData: FormData, name: string, fallback: number): number {
  const value = text(formData, name);
  if (value === '') return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Checkbox state. Unchecked boxes are simply absent from FormData. */
export function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === 'on';
}

/** Restricts a submitted value to a known set, falling back when it is not. */
export function oneOf<T extends string>(
  formData: FormData,
  name: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = text(formData, name);
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Same as `oneOf` but allows "no selection". */
export function oneOfOrNull<T extends string>(
  formData: FormData,
  name: string,
  allowed: readonly T[],
): T | null {
  const value = text(formData, name);
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

/** Reads a repeated field, e.g. an ordered list of ids from a sortable list. */
export function textList(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);
}

/* --- Audit trail --------------------------------------------------------- */

/**
 * Records an action in the activity log. Failures here must never break the
 * operation the user actually asked for, so errors are swallowed.
 */
export async function logActivity(
  user: SessionUser | null,
  entry: {
    action: string;
    entityType: string;
    entityId?: string | null;
    summary: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: user?.id ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        summary: entry.summary,
        metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : undefined,
      },
    });
  } catch {
    // Auditing is best-effort; never fail the user's request because of it.
  }
}

/** Maps a Prisma unique-constraint violation to a friendly field message. */
export function uniqueConstraintFields(error: unknown): string[] {
  const meta = (error as { code?: string; meta?: { target?: unknown } } | null)?.meta;
  const code = (error as { code?: string } | null)?.code;
  if (code !== 'P2002') return [];

  const target = meta?.target;
  if (Array.isArray(target)) return target.filter((value): value is string => typeof value === 'string');
  if (typeof target === 'string') return [target];
  return [];
}
