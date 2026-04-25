import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  asChild?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', type = 'button', asChild = false, children, ...props },
  ref,
) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
    variant === 'primary' && 'bg-primary text-white hover:opacity-90',
    variant === 'secondary' && 'bg-secondary text-sky-900 hover:bg-sky-100',
    variant === 'ghost' && 'bg-transparent text-foreground hover:bg-slate-100',
    variant === 'danger' && 'bg-danger text-white hover:opacity-90',
    className,
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(classes, (children as React.ReactElement<any>).props.className),
      ...props,
    });
  }

  return (
    <button ref={ref} type={type} className={classes} {...props}>
      {children}
    </button>
  );
});
