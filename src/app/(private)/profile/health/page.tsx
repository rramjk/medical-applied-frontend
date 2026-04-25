'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  createHealthProfile,
  getUserHealthProfileByUserId,
  updateHealthProfile,
} from '@/shared/api/users';
import { AuthGuard } from '@/entities/user/ui/auth-guard';
import { useAuthStore } from '@/shared/stores/auth-store';
import {
  extractErrorMessage,
  parseCommaSeparatedString,
  toCommaSeparatedString,
} from '@/shared/lib/utils';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { SectionHeader } from '@/shared/ui/section-header';
import { Textarea } from '@/shared/ui/textarea';

const schema = z.object({
  weight: z.coerce.number().positive('Вес должен быть больше 0'),
  chronicConditions: z.string().optional(),
  healthFeatures: z.string().optional(),
  allergies: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function isNotFoundError(error: unknown) {
  return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      error.status === 404
  );
}

export default function HealthProfilePage() {
  const queryClient = useQueryClient();

  const identity = useAuthStore((state) => state.identity);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      weight: 0,
      chronicConditions: '',
      healthFeatures: '',
      allergies: '',
    },
  });

  const profileQuery = useQuery({
    queryKey: ['health-profile', identity?.id],
    queryFn: () => getUserHealthProfileByUserId(identity!.id),
    enabled: Boolean(identity?.id),
    staleTime: 0,
    refetchOnMount: 'always',
    retry: (failureCount, queryError) => {
      if (isNotFoundError(queryError)) {
        return false;
      }

      return failureCount < 2;
    },
  });

  const healthProfile = profileQuery.data;
  const healthId = healthProfile?.id ?? null;

  const isProfileNotFound =
      profileQuery.isError && isNotFoundError(profileQuery.error);

  useEffect(() => {
    if (!healthProfile) {
      return;
    }

    form.reset({
      weight: healthProfile.weight,
      chronicConditions: toCommaSeparatedString(
          healthProfile.chronicConditions,
      ),
      healthFeatures: toCommaSeparatedString(healthProfile.healthFeatures),
      allergies: toCommaSeparatedString(healthProfile.allergies),
    });
  }, [form, healthProfile]);

  useEffect(() => {
    if (!profileQuery.isError) {
      return;
    }

    if (isNotFoundError(profileQuery.error)) {
      setError(null);
      return;
    }

    setError(extractErrorMessage(profileQuery.error));
  }, [profileQuery.error, profileQuery.isError]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!identity?.id) {
        throw new Error('Пользователь не авторизован');
      }

      const payload = {
        weight: values.weight,
        chronicConditions: parseCommaSeparatedString(
            values.chronicConditions || '',
        ),
        healthFeatures: parseCommaSeparatedString(values.healthFeatures || ''),
        allergies: parseCommaSeparatedString(values.allergies || ''),
      };

      if (healthId) {
        return updateHealthProfile(identity.id, healthId, payload);
      }

      return createHealthProfile(identity.id, payload);
    },

    onSuccess: async () => {
      setMessage('Профиль здоровья сохранен.');
      setError(null);

      await queryClient.invalidateQueries({
        queryKey: ['health-profile', identity?.id],
      });
    },

    onError: (submitError) => {
      setError(extractErrorMessage(submitError));
      setMessage(null);
    },
  });

  return (
      <AuthGuard>
        <div className="space-y-6">
          <SectionHeader
              eyebrow="Профиль здоровья"
              title="Персональный профиль здоровья"
              description="Эта форма не ставит диагноз. Она нужна только для более осторожной информационной выдачи и для AI-модуля."
          />

          {profileQuery.isLoading ? (
              <Alert
                  title="Загружаем профиль"
                  tone="info"
                  description="Получаем актуальные данные здоровья из backend."
              />
          ) : null}

          {isProfileNotFound ? (
              <Alert
                  title="Профиль ещё не создан"
                  tone="warning"
                  description="Заполните форму и сохраните данные. После этого профиль здоровья будет создан."
              />
          ) : null}

          {error ? (
              <Alert
                  title="Не удалось загрузить или сохранить профиль"
                  tone="danger"
                  description={error}
              />
          ) : null}

          {message ? (
              <Alert title="Готово" tone="success" description={message} />
          ) : null}

          <Card>
            <CardHeader>
              <h1 className="text-2xl font-semibold text-foreground">
                Данные здоровья
              </h1>
            </CardHeader>

            <CardContent>
              <form
                  className="grid gap-4"
                  onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Вес, кг</label>
                  <Input type="number" step="0.1" {...form.register('weight')} />
                  {form.formState.errors.weight ? (
                      <p className="text-xs text-danger">
                        {form.formState.errors.weight.message}
                      </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Хронические заболевания
                  </label>
                  <Textarea
                      placeholder="Через запятую"
                      {...form.register('chronicConditions')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Особенности здоровья
                  </label>
                  <Textarea
                      placeholder="Через запятую"
                      {...form.register('healthFeatures')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Аллергии</label>
                  <Textarea
                      placeholder="Через запятую"
                      {...form.register('allergies')}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                      type="submit"
                      disabled={mutation.isPending || profileQuery.isLoading}
                  >
                    {mutation.isPending
                        ? 'Сохраняем...'
                        : healthId
                            ? 'Обновить профиль'
                            : 'Создать профиль'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
  );
}