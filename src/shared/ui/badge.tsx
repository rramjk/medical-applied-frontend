import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

export function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  children: ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variant === 'neutral' && 'bg-slate-100 text-slate-700',
        variant === 'success' && 'bg-emerald-50 text-emerald-700',
        variant === 'warning' && 'bg-amber-50 text-amber-700',
        variant === 'danger' && 'bg-rose-50 text-rose-700',
        variant === 'info' && 'bg-sky-50 text-sky-700',
        className,
      )}
    >
      {children}
    </span>
  );
}
