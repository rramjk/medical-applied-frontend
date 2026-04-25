import { appConfig } from '@/shared/config/app';
import { decodeJwt } from '@/shared/lib/utils';
import type { AuthIdentity } from '@/shared/types/api';

const COOKIE_NAME = 'ma_access_token';

let memoryAccessToken: string | null = null;

const AUTH_STORAGE_KEYS = Array.from(
    new Set([appConfig.storageKeys.auth, 'ma_auth', 'ma-auth']),
);

export function setAccessToken(token: string) {
  memoryAccessToken = token;
  setAuthCookie(token);
}

export function getAccessToken() {
  return memoryAccessToken ?? getTokenFromStorage();
}

export function setAuthCookie(token: string) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      token,
  )}; path=/; samesite=lax; max-age=86400`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
}

export function clearPersistedAuth() {
  memoryAccessToken = null;

  if (typeof window !== 'undefined') {
    for (const key of AUTH_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
  }

  clearAuthCookie();
}

export function notifyAuthInvalidated() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event('ma-auth-invalidated'));
}

export function getTokenFromStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const key of AUTH_STORAGE_KEYS) {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as {
        state?: {
          token?: unknown;
        };
      };

      const token = parsed.state?.token;

      if (typeof token === 'string' && token.length > 0) {
        return token;
      }
    } catch {
      // ignore invalid storage entry
    }
  }

  return null;
}

export function getAuthIdentity(token: string | null): AuthIdentity | null {
  if (!token) {
    return null;
  }

  const payload = decodeJwt(token);

  if (!payload?.id || !payload.role) {
    return null;
  }

  return {
    id: payload.id,
    email: payload.email ?? payload.sub,
    role: payload.role,
    exp: payload.exp,
  };
}

export function isTokenExpired(token: string | null) {
  const payload = token ? decodeJwt(token) : null;

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}