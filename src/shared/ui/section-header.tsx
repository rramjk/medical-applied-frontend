import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</p> : null}
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h2>
        {description ? <p className="max-w-3xl text-sm text-muted md:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
