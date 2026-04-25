'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { verifyUser } from '@/shared/api/users';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { extractErrorMessage } from '@/shared/lib/utils';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const identity = useAuthStore((state) => state.identity);
  const userId = searchParams.get('userId') || identity?.id || '';
  const token = searchParams.get('token') || '';

  const mutation = useMutation({ mutationFn: () => verifyUser(userId, token) });

  return (
    <div className="mx-auto max-w-xl py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-foreground">Подтверждение email</h1>
          <p className="text-sm text-muted">Для подтверждения email откройте ссылку из письма в браузере с активной сессией.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!identity ? (
            <Alert title="Нужен активный сеанс" tone="warning" description={<span>Сначала войдите в аккаунт, затем вернитесь на эту страницу. <Link href="/auth/login" className="underline">Войти</Link></span>} />
          ) : null}
          {!token ? <Alert title="Токен не найден" tone="danger" description="Откройте страницу с параметром ?token=..." /> : null}
          {mutation.isError ? <Alert title="Верификация не выполнена" tone="danger" description={extractErrorMessage(mutation.error)} /> : null}
          {mutation.isSuccess ? <Alert title="Email подтвержден" tone="success" description={`Статус: ${mutation.data.status}`} /> : null}
          <Button disabled={!identity || !token || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Проверяем...' : 'Подтвердить email'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
