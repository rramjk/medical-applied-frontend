import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { calculateAge } from '@/shared/lib/utils';
import type { UserDto } from '@/shared/types/api';

export function ProfileSummary({ user }: { user: UserDto }) {
  const age = calculateAge(user.birthDate);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted">Личный кабинет</p>
          <h1 className="text-2xl font-semibold text-foreground">
            {user.firstName} {user.lastName}
          </h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="info">{user.roleName}</Badge>
          <Badge variant={user.emailVerified ? 'success' : 'warning'}>
            {user.emailVerified ? 'Email подтвержден' : 'Email не подтвержден'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm text-muted">Возраст</div>
          <div className="mt-1 text-lg font-semibold text-foreground">{age ?? '—'}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm text-muted">Пол</div>
          <div className="mt-1 text-lg font-semibold text-foreground">
            {user.gender === 'MALE' ? 'Мужской' : 'Женский'}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm text-muted">Юридические согласия</div>
          <div className="mt-1 text-sm font-semibold text-foreground">
            {user.userConsent && user.privacyConsent ? 'Все подтверждено' : 'Нужно обновить'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
