import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Softly rounded buttons. gold is the house call to action; the outline pair
 * are for the secondary choice beside it, one for each ground.
 */
export type ButtonVariant =
  | 'gold'
  | 'outlineGold'
  | 'solid'
  | 'inverse'
  | 'outline'
  | 'outlineLight'
  | 'ghost';
export type ButtonSize = 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  gold: 'bg-gold text-night hover:bg-gold-soft',
  outlineGold: 'border border-gold/50 text-gold hover:border-gold hover:bg-gold hover:text-night',
  solid: 'bg-ink text-paper hover:bg-ink-raised',
  inverse: 'bg-paper text-ink hover:bg-white',
  outline: 'border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper',
  outlineLight: 'border border-paper/35 text-paper hover:border-paper hover:bg-paper hover:text-ink',
  ghost: 'text-ink hover:bg-ink/5',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[0.9375rem]',
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    'group inline-flex select-none items-center justify-center gap-2.5 rounded-[var(--radius-control)]',
    'font-medium tracking-tight transition-colors duration-300',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

/** The arrow flips automatically for right-to-left layouts. */
function Arrow() {
  return (
    <ArrowRight
      aria-hidden="true"
      className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
    />
  );
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  withArrow?: boolean;
  external?: boolean;
} & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>;

export function ButtonLink({
  href,
  children,
  variant = 'solid',
  size = 'md',
  className,
  withArrow = false,
  external = false,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonClasses(variant, size, className);

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
        {withArrow ? <Arrow /> : null}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
      {withArrow ? <Arrow /> : null}
    </Link>
  );
}

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  withArrow?: boolean;
} & ComponentProps<'button'>;

export function Button({
  children,
  variant = 'solid',
  size = 'md',
  className,
  withArrow = false,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
      {withArrow ? <Arrow /> : null}
    </button>
  );
}

/** Understated text link with a moving arrow, used to close editorial blocks. */
export function ArrowLink({
  href,
  children,
  className,
  external = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const classes = cn(
    'group inline-flex items-center gap-2.5 border-b border-current/30 pb-1',
    'text-sm font-medium transition-colors duration-300 hover:border-current',
    className,
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
        <Arrow />
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      <Arrow />
    </Link>
  );
}
