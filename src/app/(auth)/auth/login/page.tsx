'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '@/shared/api/auth';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { extractErrorMessage } from '@/shared/lib/utils';

const schema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setToken = useAuthStore((state) => state.setToken);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setError(null);
      const response = await login(values);
      setToken(response.accessToken);
      router.push(searchParams.get('next') || '/profile');
    } catch (submitError) {
      setError(extractErrorMessage(submitError));
    }
  });

  return (
    <div className="mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-foreground">Вход в Medical Applied</h1>
          <p className="text-sm text-muted">Войдите, чтобы открыть каталог, личный кабинет, историю просмотров и AI-ассистент.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <Alert title="Не удалось войти" tone="danger" description={error} /> : null}
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input type="email" placeholder="mail@gmail.com" {...form.register('email')} />
              {form.formState.errors.email ? <p className="text-xs text-danger">{form.formState.errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Пароль</label>
              <Input type="password" placeholder="Ваш пароль" {...form.register('password')} />
              {form.formState.errors.password ? <p className="text-xs text-danger">{form.formState.errors.password.message}</p> : null}
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? 'Входим...' : 'Войти'}
            </Button>
          </form>
          <div className="space-y-3 text-sm text-muted">
            <p>
              Сменить пароль можно в <Link href="/settings" className="underline">настройках</Link> после входа.
            </p>
            <p>
              Нет аккаунта? <Link href="/auth/register" className="font-medium text-primary">Зарегистрироваться</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
