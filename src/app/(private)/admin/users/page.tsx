'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteUser, getUsers } from '@/shared/api/users';
import { AuthGuard } from '@/entities/user/ui/auth-guard';
import { formatDate } from '@/shared/lib/utils';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { SectionHeader } from '@/shared/ui/section-header';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: getUsers });
  const deleteMutation = useMutation({ mutationFn: (id: string) => deleteUser(id), onSuccess: () => usersQuery.refetch() });

  const users = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return usersQuery.data ?? [];
    return (usersQuery.data ?? []).filter((user) =>
      [user.firstName, user.lastName, user.email, user.roleName].some((part) => part?.toLowerCase().includes(value)),
    );
  }, [search, usersQuery.data]);

  return (
    <AuthGuard roles={['ADMIN']}>
      <div className="space-y-6">
        <SectionHeader eyebrow="Admin contour" title="Управление пользователями" description="Раздел доступен администраторам и предназначен для просмотра и удаления пользовательских аккаунтов." />
        {deleteMutation.isError ? <Alert title="Не удалось удалить пользователя" tone="danger" description="Проверьте данные и повторите попытку позже." /> : null}
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Список пользователей</h2>
              <p className="text-sm text-muted">Всего: {users.length}</p>
            </div>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по email или имени" className="md:max-w-xs" />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="pb-3 pr-4">Пользователь</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Роль</th>
                  <th className="pb-3 pr-4">Verification</th>
                  <th className="pb-3 pr-4">Создан</th>
                  <th className="pb-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 align-top">
                    <td className="py-4 pr-4 font-medium text-foreground">{user.firstName} {user.lastName}</td>
                    <td className="py-4 pr-4 text-muted">{user.email}</td>
                    <td className="py-4 pr-4 text-muted">{user.roleName}</td>
                    <td className="py-4 pr-4 text-muted">{user.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}</td>
                    <td className="py-4 pr-4 text-muted">{formatDate(user.createdDate)}</td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" onClick={() => deleteMutation.mutate(user.id)} disabled={deleteMutation.isPending}>Удалить</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
