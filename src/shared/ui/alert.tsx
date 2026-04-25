import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

export function Alert({
  title,
  description,
  tone = 'info',
  className,
}: {
  title: string;
  description: ReactNode;
  tone?: 'info' | 'warning' | 'danger' | 'success';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        tone === 'info' && 'border-sky-200 bg-sky-50 text-sky-900',
        tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-900',
        tone === 'danger' && 'border-rose-200 bg-rose-50 text-rose-900',
        tone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
        className,
      )}
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm opacity-90">{description}</div>
    </div>
  );
}
