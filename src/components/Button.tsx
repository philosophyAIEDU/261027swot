import type { ComponentPropsWithRef, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand text-brand-ink hover:bg-brand-hover border-2 border-brand',
  secondary: 'bg-surface text-ink border-2 border-line hover:border-brand hover:bg-brand-soft',
  ghost: 'bg-transparent text-ink border-2 border-transparent hover:bg-brand-soft',
};

export function Button({ variant = 'primary', className = '', type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 print:hidden ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
