import { apiRequest } from '@/shared/api/http';
import type {
  EmailVerificationDto,
  MedicalDto,
  ResetPasswordRequestDto,
  UserCreateRequestDto,
  UserDto,
  UserHealthProfileDto,
  UserHealthProfileRequestDto,
  UserRequestDto,
} from '@/shared/types/api';

export function createUser(payload: UserCreateRequestDto) {
  return apiRequest<UserDto>({ path: '/api/users', method: 'POST', body: payload });
}

export function getUsers() {
  return apiRequest<UserDto[]>({ path: '/api/users' });
}

export function getUserById(id: string) {
  return apiRequest<UserDto>({ path: `/api/users/${id}` });
}

export function updateUser(id: string, payload: UserRequestDto) {
  return apiRequest<UserDto>({ path: `/api/users/${id}`, method: 'POST', body: payload });
}

export function deleteUser(id: string) {
  return apiRequest<UserDto>({ path: `/api/users/${id}`, method: 'DELETE' });
}

export function getUserViews(id: string) {
  return apiRequest<MedicalDto[]>({ path: `/api/users/${id}/views` });
}

export function clearUserViews(id: string) {
  return apiRequest<void>({ path: `/api/users/${id}/views`, method: 'DELETE', responseType: 'void' });
}

export function createHealthProfile(id: string, payload: UserHealthProfileRequestDto) {
  return apiRequest<UserHealthProfileDto>({ path: `/api/users/${id}/health`, method: 'POST', body: payload });
}

export function getUserHealthProfileByUserId(userId: string) {
  return apiRequest<UserHealthProfileDto>({
    path: `/api/users/${userId}/health`,
    method: 'GET',
  });
}

export function updateHealthProfile(id: string, healthId: string, payload: UserHealthProfileRequestDto) {
  return apiRequest<UserHealthProfileDto>({
    path: `/api/users/${id}/health/${healthId}`,
    method: 'PUT',
    body: payload,
  });
}

export function getHealthProfile(id: string, healthId: string) {
  return apiRequest<UserHealthProfileDto>({ path: `/api/users/${id}/health/${healthId}` });
}

export function deleteHealthProfile(id: string, healthId: string) {
  return apiRequest<UserHealthProfileDto>({ path: `/api/users/${id}/health/${healthId}`, method: 'DELETE' });
}

export function createVerificationRequest(id: string) {
  return apiRequest<EmailVerificationDto>({ path: `/api/users/${id}/verify`, method: 'POST' });
}

export function getVerificationStatus(id: string) {
  return apiRequest<EmailVerificationDto>({ path: `/api/users/${id}/verify/status` });
}

export function verifyUser(id: string, token: string) {
  const query = new URLSearchParams({ token, verificationToken: token });
  return apiRequest<EmailVerificationDto>({ path: `/api/users/${id}/verify?${query.toString()}` });
}

export function resetPassword(id: string, payload: ResetPasswordRequestDto) {
  return apiRequest<void>({
    path: `/api/users/${id}/reset-password`,
    method: 'POST',
    body: payload,
    responseType: 'void',
  });
}
