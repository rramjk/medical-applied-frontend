import { apiRequest } from '@/shared/api/http';
import type { MedicalDto } from '@/shared/types/api';

export interface MedicalQueryParams {
  countryEn?: string;
  category?: string;
  name?: string;
}

export function getMedicals(params: MedicalQueryParams = {}) {
  const query = new URLSearchParams();
  if (params.countryEn) query.set('countryEn', params.countryEn);
  if (params.category) query.set('category', params.category);
  if (params.name) query.set('name', params.name);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<MedicalDto[]>({ path: `/api/medicals${suffix}` });
}

export function getMedicalById(id: string) {
  return apiRequest<MedicalDto>({ path: `/api/medicals/${id}` });
}

export function getMedicalCategories() {
  return apiRequest<string[]>({ path: '/api/medicals/categories' });
}

export function getMedicalCountries(translateCountry = true) {
  const query = new URLSearchParams({
    translateCountry: String(translateCountry),
    translateCountryName: String(translateCountry),
  });
  return apiRequest<string[]>({ path: `/api/medicals/countries?${query.toString()}` });
}

export function getMedicalNames() {
  return apiRequest<string[]>({ path: '/api/medicals/names' });
}

export function getSeoContent() {
  return apiRequest<string>({ path: '/api/seo/content', responseType: 'text' });
}
