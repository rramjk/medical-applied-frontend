'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createVerificationRequest, deleteUser, getVerificationStatus, resetPassword, updateUser } from '@/shared/api/users';
import { AuthGuard } from '@/entities/user/ui/auth-guard';
import { useCurrentUser } from '@/shared/hooks/use-current-user';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { SectionHeader } from '@/shared/ui/section-header';
import { extractErrorMessage } from '@/shared/lib/utils';

const profileSchema = z.object({
  firstName: z.string().regex(/^[\p{L}-]{2,12}$/u, '2–12 букв или дефис'),
  lastName: z.string().regex(/^[\p{L}-]{2,12}$/u, '2–12 букв или дефис'),
  birthDate: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE']),
  email: z.string().regex(/^[\w.]{1,25}@gmail\.com$/, 'Используйте адрес gmail.com'),
  userConsent: z.boolean(),
  privacyConsent: z.boolean(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Введите старый пароль'),
  newPassword: z.string().regex(/^[\w.!%$]{5,15}$/, 'Пароль: 5-15 символов, [a-zA-Z0-9_.!%$]'),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const identity = useAuthStore((state) => state.identity);
  const logout = useAuthStore((state) => state.logout);
  const currentUserQuery = useCurrentUser();
  const verificationQuery = useQuery({ queryKey: ['settings-verification', identity?.id], queryFn: () => getVerificationStatus(identity!.id), enabled: Boolean(identity?.id) });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isEmailVerified = verificationQuery.data?.status === 'VERIFIED';
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: currentUserQuery.data
      ? {
          firstName: currentUserQuery.data.firstName,
          lastName: currentUserQuery.data.lastName,
          birthDate: currentUserQuery.data.birthDate,
          gender: currentUserQuery.data.gender,
          email: currentUserQuery.data.email,
          userConsent: currentUserQuery.data.userConsent,
          privacyConsent: currentUserQuery.data.privacyConsent,
        }
      : undefined,
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema), defaultValues: { oldPassword: '', newPassword: '' } });

  const updateMutation = useMutation({
    mutationFn: (values: ProfileForm) => updateUser(identity!.id, values),

    onSuccess: async (_, values) => {
      const previousEmail = currentUserQuery.data?.email;
      const emailChanged = Boolean(previousEmail && previousEmail !== values.email);

      setError(null);

      if (emailChanged) {
        setMessage(
            'Email обновлён. Для продолжения работы войдите заново с новым адресом.',
        );

        setTimeout(() => {
          logout();
          window.location.href = '/auth/login';
        }, 1500);

        return;
      }

      setMessage('Профиль обновлён.');

      await currentUserQuery.refetch();
      await verificationQuery.refetch();
    },

    onError: (submitError) => {
      setError(extractErrorMessage(submitError));
      setMessage(null);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (values: PasswordForm) => resetPassword(identity!.id, values),
    onSuccess: () => {
      setMessage('Пароль обновлен.');
      setError(null);
      passwordForm.reset();
    },
    onError: (submitError) => {
      setError(extractErrorMessage(submitError));
      setMessage(null);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => createVerificationRequest(identity!.id),
    onSuccess: (data) => {
      setMessage(`Статус запроса на верификацию: ${data.status}`);
      setError(null);
      verificationQuery.refetch();
    },
    onError: (submitError) => {
      setError(extractErrorMessage(submitError));
      setMessage(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(identity!.id),
    onSuccess: () => {
      logout();
      window.location.href = '/';
    },
    onError: (submitError) => setError(extractErrorMessage(submitError)),
  });

  return (
    <AuthGuard>
      <div className="space-y-6">
        <SectionHeader eyebrow="Настройки" title="Управление аккаунтом" description="Здесь собраны обновление профиля, смена пароля, юридические согласия и подтверждение email." />
        {message ? <Alert title="Готово" tone="success" description={message} /> : null}
        {error ? <Alert title="Ошибка" tone="danger" description={error} /> : null}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-foreground">Основные данные</h2></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={profileForm.handleSubmit((values) => updateMutation.mutate(values))}>
                <Input placeholder="Имя" {...profileForm.register('firstName')} />
                <Input placeholder="Фамилия" {...profileForm.register('lastName')} />
                <Input type="date" {...profileForm.register('birthDate')} />
                <Select {...profileForm.register('gender')}>
                  <option value="MALE">Мужской</option>
                  <option value="FEMALE">Женский</option>
                </Select>
                <Input type="email" placeholder="mail@gmail.com" {...profileForm.register('email')} />
                <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Сохраняем...' : 'Сохранить профиль'}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-foreground">Смена пароля</h2></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={passwordForm.handleSubmit((values) => passwordMutation.mutate(values))}>
                <Input type="password" placeholder="Старый пароль" {...passwordForm.register('oldPassword')} />
                <Input type="password" placeholder="Новый пароль" {...passwordForm.register('newPassword')} />
                <Button type="submit" disabled={passwordMutation.isPending}>{passwordMutation.isPending ? 'Сохраняем...' : 'Сменить пароль'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-foreground">Подтверждение email</h2></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted">
              <p>Текущий статус: <span className="font-semibold text-foreground">{verificationQuery.data?.status ?? '—'}</span></p>
              {isEmailVerified ? (
                  <Alert
                      title="Email подтверждён"
                      tone="success"
                      description="Ваш адрес электронной почты уже подтверждён. Повторная верификация не требуется."
                  />
              ) : (
                  <>
                    <p>
                      Нажмите кнопку ниже, чтобы получить письмо для подтверждения адреса.
                      Открывайте ссылку в браузере с активной сессией.
                    </p>

                    <Button
                        onClick={() => verifyMutation.mutate()}
                        disabled={verifyMutation.isPending || verificationQuery.isLoading}
                    >
                      {verifyMutation.isPending
                          ? 'Отправляем...'
                          : 'Отправить письмо подтверждения'}
                    </Button>
                  </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-danger">Опасная зона</h2></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted">
              <p>Удаление аккаунта необратимо. После удаления текущая сессия будет завершена.</p>
              <Button variant="danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Удаляем...' : 'Удалить аккаунт'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
