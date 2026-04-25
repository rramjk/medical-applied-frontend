import { appConfig } from '@/shared/config/app';
import type { AiConversation } from '@/shared/types/api';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getHealthProfileId() {
  return typeof window === 'undefined'
    ? null
    : window.localStorage.getItem(appConfig.storageKeys.healthProfileId);
}

export function setHealthProfileId(id: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(appConfig.storageKeys.healthProfileId, id);
}

export function clearHealthProfileId() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(appConfig.storageKeys.healthProfileId);
}

export function getAiHistory() {
  return readJson<AiConversation[]>(appConfig.storageKeys.aiHistory, []);
}

export function saveAiConversation(conversation: AiConversation) {
  const current = getAiHistory().filter((item) => item.id !== conversation.id);
  const next = [conversation, ...current].slice(0, 15);
  writeJson(appConfig.storageKeys.aiHistory, next);
  return next;
}

export function clearAiHistory() {
  writeJson(appConfig.storageKeys.aiHistory, [] as AiConversation[]);
}
