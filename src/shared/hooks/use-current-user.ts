'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserById } from '@/shared/api/users';
import { useAuthStore } from '@/shared/stores/auth-store';

export function useCurrentUser() {
  const identity = useAuthStore((state) => state.identity);

  return useQuery({
    queryKey: ['current-user', identity?.id],
    queryFn: () => getUserById(identity!.id),
    enabled: Boolean(identity?.id),
  });
}
