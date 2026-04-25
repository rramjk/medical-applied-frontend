'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, LogOut } from 'lucide-react';

import { logout } from '@/shared/api/auth';
import { appConfig } from '@/shared/config/app';
import { extractErrorMessage } from '@/shared/lib/utils';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

const authNav = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/map', label: 'Карта аптек' },
  { href: '/ai-chat', label: 'AI-ассистент' },
  { href: '/about', label: 'О сервисе' },
];

const publicNav = [
  { href: '/about', label: 'О сервисе' },
];

const adminNav = [
  { href: '/admin/users', label: 'Пользователи' },
];

export function SiteHeader() {
  const router = useRouter();

  const identity = useAuthStore((state) => state.identity);
  const token = useAuthStore((state) => state.token);
  const clearAuth = useAuthStore((state) => state.logout);

  const isAuthenticated = Boolean(identity);
  const isAdmin = identity?.role === 'ADMIN';

  const handleLogout = async () => {
    try {
      if (token) {
        await logout(token);
      }
    } catch (error) {
      console.error(extractErrorMessage(error));
    } finally {
      clearAuth();
      router.push('/');
    }
  };

  return (
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary font-semibold text-white">
                MA
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {appConfig.name}
                </div>
                <div className="text-xs text-muted">
                  Medical travel helper UI
                </div>
              </div>
            </Link>
          </div>

          {isAuthenticated && (
              <form
                  className="relative flex-1 lg:max-w-xl"
                  onSubmit={(event) => {
                    event.preventDefault();

                    const data = new FormData(event.currentTarget);
                    const search = String(data.get('globalSearch') || '').trim();

                    router.push(
                        search
                            ? `/catalog?name=${encodeURIComponent(search)}`
                            : '/catalog',
                    );
                  }}
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    name="globalSearch"
                    placeholder="Поиск препарата по названию"
                    className="pl-10"
                />
              </form>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              {(isAuthenticated ? authNav : publicNav).map((item) => (
                  <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
              ))}

              {isAdmin &&
                  adminNav.map((item) => (
                      <Link
                          key={item.href}
                          href={item.href}
                          className="rounded-full px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        {item.label}
                      </Link>
                  ))}
            </nav>

            {identity ? (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => router.push('/profile')}>
                    {identity.email}
                  </Button>

                  <Button
                      variant="ghost"
                      onClick={() => void handleLogout()}
                      aria-label="Выйти"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
            ) : (
                <Button onClick={() => router.push('/auth/login')}>Войти</Button>
            )}
          </div>
        </div>
      </header>
  );
}