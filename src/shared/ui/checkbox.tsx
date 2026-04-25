import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export function Checkbox({ className, label, description, ...props }: CheckboxProps) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4">
      <input type="checkbox" className={cn('mt-1 h-4 w-4 rounded border-border text-primary', className)} {...props} />
      <span className="space-y-1">
        {label ? <span className="block text-sm font-medium text-foreground">{label}</span> : null}
        {description ? <span className="block text-sm text-muted">{description}</span> : null}
      </span>
    </label>
  );
}
