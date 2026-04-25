'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUser } from '@/shared/api/users';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { extractErrorMessage } from '@/shared/lib/utils';

const schema = z
  .object({
    firstName: z.string().regex(/^[\p{L}-]{2,12}$/u, '2–12 букв или дефис'),
    lastName: z.string().regex(/^[\p{L}-]{2,12}$/u, '2–12 букв или дефис'),
    birthDate: z.string().min(1, 'Укажите дату рождения'),
    gender: z.enum(['MALE', 'FEMALE']),
    email: z.string().regex(/^[\w.]{1,25}@gmail\.com$/, 'Используйте адрес gmail.com'),
    password: z.string().regex(/^[\w.!%$]{5,15}$/, 'Пароль: 5-15 символов, [a-zA-Z0-9_.!%$]'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
    userConsent: z.boolean().refine(Boolean, 'Нужно согласие с пользовательским соглашением'),
    privacyConsent: z.boolean().refine(Boolean, 'Нужно согласие с политикой конфиденциальности'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'MALE',
      email: '',
      password: '',
      confirmPassword: '',
      userConsent: false,
      privacyConsent: false,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setError(null);
      setSuccess(null);
      await createUser({
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate,
        gender: values.gender,
        email: values.email,
        password: values.password,
        userConsent: values.userConsent,
        privacyConsent: values.privacyConsent,
      });
      setSuccess('Аккаунт создан. Теперь можно войти и подтвердить email в настройках.');
      setTimeout(() => router.push('/auth/login'), 1200);
    } catch (submitError) {
      setError(extractErrorMessage(submitError));
    }
  });

  return (
    <div className="mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-foreground">Регистрация</h1>
          <p className="text-sm text-muted">Заполните короткую анкету, примите документы и задайте пароль длиной 5–15 символов.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <Alert title="Не удалось зарегистрироваться" tone="danger" description={error} /> : null}
          {success ? <Alert title="Готово" tone="success" description={success} /> : null}
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Имя</label>
              <Input {...form.register('firstName')} />
              {form.formState.errors.firstName ? <p className="text-xs text-danger">{form.formState.errors.firstName.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Фамилия</label>
              <Input {...form.register('lastName')} />
              {form.formState.errors.lastName ? <p className="text-xs text-danger">{form.formState.errors.lastName.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Дата рождения</label>
              <Input type="date" {...form.register('birthDate')} />
              {form.formState.errors.birthDate ? <p className="text-xs text-danger">{form.formState.errors.birthDate.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Пол</label>
              <Select {...form.register('gender')}>
                <option value="MALE">Мужской</option>
                <option value="FEMALE">Женский</option>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="mail@gmail.com" {...form.register('email')} />
              {form.formState.errors.email ? <p className="text-xs text-danger">{form.formState.errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input type="password" {...form.register('password')} />
              {form.formState.errors.password ? <p className="text-xs text-danger">{form.formState.errors.password.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Подтверждение пароля</label>
              <Input type="password" {...form.register('confirmPassword')} />
              {form.formState.errors.confirmPassword ? <p className="text-xs text-danger">{form.formState.errors.confirmPassword.message}</p> : null}
            </div>
            <div className="md:col-span-2 space-y-3">
              <Checkbox
                checked={form.watch('userConsent')}
                onChange={(event) => form.setValue('userConsent', event.target.checked, { shouldValidate: true })}
                label="Я принимаю пользовательское соглашение"
              />
              <Checkbox
                checked={form.watch('privacyConsent')}
                onChange={(event) => form.setValue('privacyConsent', event.target.checked, { shouldValidate: true })}
                label="Я принимаю политику конфиденциальности"
                description="Согласие требуется для создания аккаунта и работы персональных функций."
              />
              {form.formState.errors.userConsent ? <p className="text-xs text-danger">{form.formState.errors.userConsent.message}</p> : null}
              {form.formState.errors.privacyConsent ? <p className="text-xs text-danger">{form.formState.errors.privacyConsent.message}</p> : null}
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Создаем...' : 'Создать аккаунт'}
              </Button>
              <Link href="/auth/login" className="text-sm font-medium text-primary">Уже есть аккаунт</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
