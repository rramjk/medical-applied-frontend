'use client';

import Link from 'next/link';

import { useAuthStore } from '@/shared/stores/auth-store';

export function SiteFooter() {
  const identity = useAuthStore((state) => state.identity);
  const isAuthenticated = Boolean(identity);

  const gridClassName = isAuthenticated
      ? 'mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-muted md:grid-cols-2 lg:grid-cols-4 lg:px-6'
      : 'mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-muted md:grid-cols-2 lg:grid-cols-3 lg:px-6';

  return (
      <footer className="border-t border-slate-200 bg-white">
        <div className={gridClassName}>
          <div>
            <div className="font-semibold text-foreground">Medical Applied</div>
            <p className="mt-2">
              Справочный интерфейс для поиска лекарств, работы с профилем здоровья
              и безопасного AI-сопровождения.
            </p>
          </div>

          {isAuthenticated ? (
              <div className="space-y-2">
                <div className="font-semibold text-foreground">Навигация</div>
                <div>
                  <Link href="/catalog">Каталог</Link>
                </div>
                <div>
                  <Link href="/map">Карта аптек</Link>
                </div>
                <div>
                  <Link href="/ai-chat">AI-ассистент</Link>
                </div>
              </div>
          ) : null}

          <div className="space-y-2">
            <div className="font-semibold text-foreground">Документы</div>
            <div>
              <Link href="/terms">Пользовательское соглашение</Link>
            </div>
            <div>
              <Link href="/privacy">Политика конфиденциальности</Link>
            </div>
            <div>
              <Link href="/about">О проекте</Link>
            </div>
          </div>

          <div>
            <div className="font-semibold text-foreground">Дисклеймер</div>
            <p className="mt-2">
              Сервис не ставит диагноз и не заменяет врача. Любые рекомендации
              требуют клинической проверки и учета индивидуальных рисков.
            </p>
          </div>
        </div>
      </footer>
  );
}