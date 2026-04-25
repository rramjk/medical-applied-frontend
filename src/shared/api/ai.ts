import { apiRequest } from '@/shared/api/http';
import type { AiAnswerRequestDto } from '@/shared/types/api';

export function getAiRecommendation(countryEn: string, prompt: string) {
  const params = new URLSearchParams({
    countryEn,
    symptoms: prompt,
  });

  return apiRequest<string>({
    path: `/api/ai/recommendation?${params.toString()}`,
    method: 'GET',
    responseType: 'text',
  });
}

export function answerAiQuestion(text: string) {
  const body: AiAnswerRequestDto = {
    text,
  };

  return apiRequest<string>({
    path: '/api/ai/answer',
    method: 'POST',
    body,
    responseType: 'text',
  });
}