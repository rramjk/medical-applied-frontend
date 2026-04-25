'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getUserViews, getVerificationStatus } from '@/shared/api/users';
import { getAiHistory } from '@/shared/lib/storage';
import { AuthGuard } from '@/entities/user/ui/auth-guard';
import { ProfileSummary } from '@/entities/user/ui/profile-summary';
import { useCurrentUser } from '@/shared/hooks/use-current-user';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { SectionHeader } from '@/shared/ui/section-header';
import { Skeleton } from '@/shared/ui/skeleton';

export default function ProfilePage() {
  const identity = useAuthStore((state) => state.identity);
  const currentUserQuery = useCurrentUser();
  const viewsQuery = useQuery({ queryKey: ['profile-views', identity?.id], queryFn: () => getUserViews(identity!.id), enabled: Boolean(identity?.id) });
  const verificationQuery = useQuery({
    queryKey: ['verification-status', identity?.id],
    queryFn: () => getVerificationStatus(identity!.id),
    enabled: Boolean(identity?.id),
  });

  const aiHistory = typeof window === 'undefined' ? [] : getAiHistory();

  return (
    <AuthGuard>
      <div className="space-y-6">
        <SectionHeader eyebrow="Личный раздел" title="Личный кабинет" description="Краткая сводка аккаунта, здоровья, истории и персональных действий." />
        {currentUserQuery.isLoading || !currentUserQuery.data ? <Skeleton className="h-[220px]" /> : <ProfileSummary user={currentUserQuery.data} />}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card><CardContent className="p-6"><div className="text-sm text-muted">Просмотры</div><div className="mt-2 text-3xl font-semibold">{viewsQuery.data?.length ?? 0}</div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="text-sm text-muted">AI-диалоги</div><div className="mt-2 text-3xl font-semibold">{aiHistory.length}</div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="text-sm text-muted">Подтверждение email</div><div className="mt-2 text-lg font-semibold">{verificationQuery.data?.status ?? '—'}</div></CardContent></Card>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-foreground">Быстрые действия</h2></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Button asChild><Link href="/profile/health">Профиль здоровья</Link></Button>
              <Button asChild variant="secondary"><Link href="/history/views">История просмотров</Link></Button>
              <Button asChild variant="ghost"><Link href="/settings">Настройки</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
