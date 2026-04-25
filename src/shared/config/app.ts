export const appConfig = {
  name: 'Medical Applied',
  apiBaseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8090',
  yandexMapsApiKey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? '',
  storageKeys: {
    auth: 'ma-auth',
    healthProfileId: 'ma-health-profile-id',
    aiHistory: 'ma-ai-history',
  },
} as const;
