import { apiRequest } from '@/shared/api/http';
import type {
  JwtAuthenticationResponse,
  LoginRequestDto,
} from '@/shared/types/api';

export function login(payload: LoginRequestDto) {
  return apiRequest<JwtAuthenticationResponse>({
    path: '/api/login',
    method: 'POST',
    body: payload,
  });
}

export function logout(token?: string | null) {
  return apiRequest<void>({
    path: '/api/logout',
    method: 'POST',
    token,
    responseType: 'void',
  });
}