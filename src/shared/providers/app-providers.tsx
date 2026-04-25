'use client';

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/shared/stores/auth-store';

function AuthInvalidationListener() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('ma-auth-invalidated', handler);
    return () => window.removeEventListener('ma-auth-invalidated', handler);
  }, [logout]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              const status = typeof error === 'object' && error && 'status' in error ? Number(error.status) : 0;
              if ([401, 403, 404].includes(status)) return false;
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInvalidationListener />
      {children}
    </QueryClientProvider>
  );
}
