import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader } from '@/shared/ui/card';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
