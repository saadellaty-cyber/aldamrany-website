import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   Uncontrolled form fields.

   Everything is driven by `name` + `defaultValue` and submitted through a
   server action, so no client-side state machinery is needed for plain forms.
------------------------------------------------------------------------- */

const controlClass =
  'w-full border border-[#d5d4ce] bg-white px-3 py-2 text-sm transition-colors ' +
  'placeholder:text-ink-muted/60 focus:border-ink focus:outline-none disabled:bg-[#f4f3ef]';

function Label({
  htmlFor,
  children,
  hint,
  required,
}: {
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex flex-wrap items-baseline gap-2">
      <span className="text-sm font-medium">
        {children}
        {required ? <span className="ms-0.5 text-danger">*</span> : null}
      </span>
      {hint ? <span className="text-xs font-normal text-ink-muted">{hint}</span> : null}
    </label>
  );
}

function Help({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{children}</p>;
}

export function TextField({
  label,
  name,
  help,
  hint,
  required,
  className,
  dir,
  ...rest
}: Omit<ComponentProps<'input'>, 'className'> & {
  label: string;
  name: string;
  help?: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={name} hint={hint} required={required}>
        {label}
      </Label>
      <input
        id={name}
        name={name}
        dir={dir}
        required={required}
        className={cn(controlClass, dir === 'rtl' && 'text-start')}
        {...rest}
      />
      <Help>{help}</Help>
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  help,
  hint,
  required,
  rows = 4,
  className,
  dir,
  ...rest
}: Omit<ComponentProps<'textarea'>, 'className'> & {
  label: string;
  name: string;
  help?: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={name} hint={hint} required={required}>
        {label}
      </Label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        dir={dir}
        required={required}
        className={cn(controlClass, 'leading-relaxed')}
        {...rest}
      />
      <Help>{help}</Help>
    </div>
  );
}

export function SelectField({
  label,
  name,
  options,
  placeholder,
  help,
  hint,
  required,
  className,
  ...rest
}: Omit<ComponentProps<'select'>, 'className' | 'children'> & {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  help?: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={name} hint={hint} required={required}>
        {label}
      </Label>
      <select
        id={name}
        name={name}
        required={required}
        className={cn(controlClass, 'cursor-pointer')}
        {...rest}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Help>{help}</Help>
    </div>
  );
}

export function CheckboxField({
  label,
  name,
  help,
  className,
  ...rest
}: Omit<ComponentProps<'input'>, 'className' | 'type'> & {
  label: string;
  name: string;
  help?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="flex items-start gap-3">
        <input
          id={name}
          name={name}
          type="checkbox"
          value="on"
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-ink)]"
          {...rest}
        />
        <span className="text-sm leading-snug">
          {label}
          <Help>{help}</Help>
        </span>
      </label>
    </div>
  );
}

/**
 * Arabic and English variants of the same field, side by side, so a translation
 * is never forgotten. Arabic inputs are rendered RTL.
 */
export function BilingualField({
  label,
  nameAr,
  nameEn,
  defaultAr,
  defaultEn,
  multiline = false,
  rows = 4,
  required = false,
  help,
  placeholderAr,
  placeholderEn,
}: {
  label: string;
  nameAr: string;
  nameEn: string;
  defaultAr?: string | null;
  defaultEn?: string | null;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  help?: ReactNode;
  placeholderAr?: string;
  placeholderEn?: string;
}) {
  const Component = multiline ? TextAreaField : TextField;

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="grid gap-4 md:grid-cols-2">
        <Component
          label="العربية — Arabic"
          name={nameAr}
          dir="rtl"
          rows={rows}
          required={required}
          defaultValue={defaultAr ?? ''}
          placeholder={placeholderAr}
        />
        <Component
          label="English"
          name={nameEn}
          dir="ltr"
          rows={rows}
          required={required}
          defaultValue={defaultEn ?? ''}
          placeholder={placeholderEn}
        />
      </div>
      <Help>{help}</Help>
    </fieldset>
  );
}
