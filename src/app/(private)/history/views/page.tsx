'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { clearUserViews, getUserViews } from '@/shared/api/users';
import { AuthGuard } from '@/entities/user/ui/auth-guard';
import { MedicalCard } from '@/entities/medical/ui/medical-card';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { SectionHeader } from '@/shared/ui/section-header';

export default function ViewsHistoryPage() {
  const identity = useAuthStore((state) => state.identity);
  const query = useQuery({ queryKey: ['views-history', identity?.id], queryFn: () => getUserViews(identity!.id), enabled: Boolean(identity?.id) });
  const clearMutation = useMutation({ mutationFn: () => clearUserViews(identity!.id), onSuccess: () => query.refetch() });

  return (
    <AuthGuard>
      <div className="space-y-6">
        <SectionHeader
          eyebrow="История просмотров"
          title="Недавно открытые препараты"
          description="История пополняется при открытии карточек препаратов."
          action={<Button variant="ghost" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>Очистить историю</Button>}
        />
        {clearMutation.isError ? <Alert title="Не удалось очистить историю" tone="danger" description="Повторите попытку позже." /> : null}
        {!query.data?.length ? (
          <EmptyState title="История просмотров пуста" description="Откройте несколько карточек препарата, и они появятся здесь." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {query.data.map((medical) => <MedicalCard key={medical.id} medical={medical} />)}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
