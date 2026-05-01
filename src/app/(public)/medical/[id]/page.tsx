'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { getMedicalById, getMedicals } from '@/shared/api/medical';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { MedicalDto } from '@/shared/types/api';
import { Alert } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { SectionHeader } from '@/shared/ui/section-header';
import { Skeleton } from '@/shared/ui/skeleton';
import { MedicalSafetyGrid } from '@/entities/medical/ui/medical-safety-grid';
import { MedicalCard } from '@/entities/medical/ui/medical-card';

const MEDICAL_IMAGES_PATH = '/images/medical';
const MEDICAL_FALLBACK_IMAGE_SRC = `${MEDICAL_IMAGES_PATH}/fallback.jpg`;

function normalizeImageFilePart(value: string) {
  return value.trim().replace(/[\\/]+/g, '-');
}

function getMedicalImageSrc(
    medical: Pick<MedicalDto, 'countryEn' | 'name'>,
) {
  const country = normalizeImageFilePart(medical.countryEn);
  const name = normalizeImageFilePart(medical.name);
  const fileName = `${country}_${name}.jpg`;

  return `${MEDICAL_IMAGES_PATH}/${encodeURIComponent(fileName)}`;
}

function MedicalDetailImage({ medical }: { medical: MedicalDto }) {
  return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
        <img
            src={getMedicalImageSrc(medical)}
            alt={`Изображение препарата ${medical.name}`}
            className="h-120 w-full object-cover"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = MEDICAL_FALLBACK_IMAGE_SRC;
            }}
        />
      </div>
  );
}

export default function MedicalDetailPage() {
  const params = useParams<{ id: string }>();
  const identity = useAuthStore((state) => state.identity);

  const detailQuery = useQuery({
    queryKey: ['medical', params.id],
    queryFn: () => getMedicalById(params.id),
    enabled: Boolean(identity && params.id),
  });

  const similarQuery = useQuery({
    queryKey: [
      'similar-medicals',
      detailQuery.data?.countryEn,
      detailQuery.data?.type,
    ],
    queryFn: () =>
        getMedicals({
          countryEn: detailQuery.data!.countryEn,
          category: detailQuery.data!.type,
        }),
    enabled: Boolean(detailQuery.data?.countryEn && detailQuery.data?.type),
  });

  const similar = useMemo(
      () =>
          (similarQuery.data ?? [])
              .filter((item) => item.id !== detailQuery.data?.id)
              .slice(0, 3),
      [detailQuery.data?.id, similarQuery.data],
  );

  if (!identity) {
    return (
        <Alert
            title="Карточка препарата защищена"
            tone="warning"
            description={
              <span>
            Сначала выполните вход.{' '}
                <Link href="/auth/login" className="underline">
              Перейти ко входу
            </Link>
          </span>
            }
        />
    );
  }

  if (detailQuery.isLoading) {
    return <Skeleton className="h-[520px]" />;
  }

  if (!detailQuery.data) {
    return (
        <EmptyState
            title="Препарат не найден"
            description="Проверьте корректность ссылки или вернитесь в каталог."
        />
    );
  }

  const medical = detailQuery.data;

  return (
      <div className="space-y-6">
        <SectionHeader
            eyebrow="Карточка препарата"
            title={medical.name}
            description="Самая важная информация вынесена наверх: категория, действующее вещество, противопоказания и quick actions."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader className="space-y-4">
              <MedicalDetailImage medical={medical} />

              <div className="flex flex-wrap gap-2">
                <Badge variant="info">
                  {medical.countryRu || medical.countryEn}
                </Badge>
                <Badge>{medical.type}</Badge>
              </div>

              <div>
                <h1 className="text-3xl font-semibold text-foreground">
                  {medical.name}
                </h1>
                <p className="mt-2 text-sm text-muted">
                  Действующее вещество:{' '}
                  {medical.activeIngredient || 'не указано'}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Описание
                </h2>
                <p className="text-sm leading-7 text-muted">
                  {medical.description || 'Описание отсутствует'}
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Показания
                </h2>
                <p className="text-sm leading-7 text-muted">
                  {medical.indications || 'Не указаны'}
                </p>
              </div>

              <Alert
                  title="Противопоказания"
                  tone="danger"
                  description={medical.contraindications || 'Не указаны'}
              />

              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Режим дозирования
                </h2>
                <p className="text-sm leading-7 text-muted">
                  {medical.dosing || 'Не указан'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-foreground">
                  Совместимость и ограничения
                </h2>
              </CardHeader>
              <CardContent>
                <MedicalSafetyGrid medical={medical} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-foreground">
                  Быстрые действия
                </h2>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button asChild>
                  <Link
                      href={`/ai-chat?countryEn=${encodeURIComponent(
                          medical.countryEn,
                      )}&symptoms=${encodeURIComponent(medical.type)}`}
                  >
                    Спросить у AI по этому препарату
                  </Link>
                </Button>

                <Button asChild variant="secondary">
                  <Link href={`/map?medicine=${encodeURIComponent(medical.name)}`}>
                    Показать аптеку рядом
                  </Link>
                </Button>

                <Button asChild variant="ghost">
                  <Link
                      href={`/catalog?countryEn=${encodeURIComponent(
                          medical.countryEn,
                      )}&category=${encodeURIComponent(medical.type)}`}
                  >
                    Вернуться к списку в этой категории
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Похожие препараты
          </h2>

          {similar.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {similar.map((item) => (
                    <MedicalCard key={item.id} medical={item} />
                ))}
              </div>
          ) : (
              <EmptyState
                  title="Похожие препараты не найдены"
                  description="Для текущей категории backend не вернул дополнительные варианты."
              />
          )}
        </section>
      </div>
  );
}