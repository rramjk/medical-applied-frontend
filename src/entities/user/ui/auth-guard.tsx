'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth-store';
import { EmptyState } from '@/shared/ui/empty-state';
import { Button } from '@/shared/ui/button';

export function AuthGuard({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Array<'USER' | 'ADMIN'>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const identity = useAuthStore((state) => state.identity);

  useEffect(() => {
    if (!identity) {
      const next = encodeURIComponent(pathname || '/profile');
      router.replace(`/auth/login?next=${next}`);
    }
  }, [identity, pathname, router]);

  if (!identity) {
    return null;
  }

  if (roles && !roles.includes(identity.role)) {
    return (
      <EmptyState
        title="Доступ ограничен"
        description="Этот раздел доступен только для нужной роли пользователя."
        action={<Button onClick={() => router.push('/profile')}>Вернуться в кабинет</Button>}
      />
    );
  }

  return <>{children}</>;
}
