import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ApiErrorResponse, JwtPayload } from '@/shared/types/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
        Math.ceil(normalized.length / 4) * 4,
        '=',
    );

    const json =
        typeof window === 'undefined'
            ? Buffer.from(padded, 'base64').toString('utf-8')
            : decodeURIComponent(
                Array.prototype.map
                    .call(atob(padded), (char: string) =>
                        `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`,
                    )
                    .join(''),
            );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: value.includes('T') ? '2-digit' : undefined,
    minute: value.includes('T') ? '2-digit' : undefined,
  }).format(date);
}

export function extractErrorMessage(error: unknown) {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const maybe = error as { message?: string; payload?: ApiErrorResponse };
    return maybe.payload?.message ?? maybe.message ?? 'Произошла неизвестная ошибка';
  }
  return 'Произошла неизвестная ошибка';
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function toCommaSeparatedString(values: string[]) {
  return values.filter(Boolean).join(', ');
}

export function parseCommaSeparatedString(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function calculateAge(birthDate?: string | null) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
