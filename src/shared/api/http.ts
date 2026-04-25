import { appConfig } from '@/shared/config/app';
import {
  clearPersistedAuth,
  getAccessToken,
  isTokenExpired,
  notifyAuthInvalidated,
} from '@/shared/lib/auth';
import type { ApiErrorResponse } from '@/shared/types/api';

export class ApiError extends Error {
  constructor(
      message: string,
      public status: number,
      public payload?: ApiErrorResponse,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
  headers?: HeadersInit;
  responseType?: 'json' | 'text' | 'void';
}

async function readErrorResponse(response: Response) {
  let payload: ApiErrorResponse | undefined;
  let message = `HTTP ${response.status}`;

  try {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      payload = (await response.json()) as ApiErrorResponse;
      message = payload.message || message;
    } else {
      const text = await response.text();
      message = text || message;
    }
  } catch {
    // ignore parsing errors
  }

  return {
    payload,
    message,
  };
}

export async function apiRequest<T>({
                                      path,
                                      method = 'GET',
                                      body,
                                      token,
                                      headers,
                                      responseType = 'json',
                                    }: RequestOptions): Promise<T> {
  const resolvedToken = token ?? getAccessToken();

  if (resolvedToken && isTokenExpired(resolvedToken)) {
    clearPersistedAuth();
    notifyAuthInvalidated();

    throw new ApiError('Сессия истекла. Войдите заново.', 401);
  }

  const requestHeaders = new Headers(headers);

  requestHeaders.set(
      'Accept',
      responseType === 'text' ? 'text/plain' : 'application/json',
  );

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (resolvedToken) {
    requestHeaders.set('Authorization', `Bearer ${resolvedToken}`);
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const { payload, message } = await readErrorResponse(response);

    if (response.status === 401) {
      clearPersistedAuth();
      notifyAuthInvalidated();
    }

    throw new ApiError(message || 'Ошибка запроса', response.status, payload);
  }

  if (responseType === 'void' || response.status === 204) {
    return undefined as T;
  }

  if (responseType === 'text') {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}