'use client';

import Link from 'next/link';
import { Brain, HeartPulse, MapPinned, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { SectionHeader } from '@/shared/ui/section-header';

const features = [
  {
    icon: HeartPulse,
    title: 'Каталог и подбор',
    description: 'Быстрый путь от страны и категории до карточки препарата с показателями применимости.',
  },
  {
    icon: ShieldAlert,
    title: 'Безопасный сценарий',
    description: 'Противопоказания и юридические предупреждения вынесены в отдельные акцентные блоки.',
  },
  {
    icon: Brain,
    title: 'AI-помощник',
    description: 'AI-ассистент учитывает страну, симптом и ваш профиль здоровья.',
  },
  {
    icon: MapPinned,
    title: 'Карта аптек',
    description: 'Поиск ближайших аптек реализован на клиенте через Yandex Maps.',
  },
];

export default function HomePage() {
  useAuthStore((state) => state.identity);
  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            Поездка без переживаний
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Лучший сервис для Вашего здоровья !
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted md:text-lg">
              Сервис помогает найти подходящий Вам препарат по стране, категории или названию, чтобы Вы максимально тонко могли найти для себя нужное лекарственное средство,
              а наш ИИ-ассистент сможет ответить на Ваши интересующие вопросы и сам порекомендовать лекарство, если это необходимо.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/ai-chat">Попробовать AI-ассистент</Link>
            </Button>
          </div>
          <Alert
            title="Важно"
            tone="warning"
            description="Каталог, карточки препаратов, история и AI-ассистент доступны после входа в аккаунт."
          />
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          title="Основные возможности сервиса"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

    </div>
  );
}
