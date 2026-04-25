'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, Sparkles } from 'lucide-react';

import { answerAiQuestion, getAiRecommendation } from '@/shared/api/ai';
import {
  getMedicalCategories,
  getMedicalCountries,
} from '@/shared/api/medical';
import { saveAiConversation } from '@/shared/lib/storage';
import { extractErrorMessage, uid } from '@/shared/lib/utils';
import type { AiConversation, AiMessage } from '@/shared/types/api';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

function createMessage(role: AiMessage['role'], content: string): AiMessage {
  return {
    id: uid(role),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function AiChatPanel() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [conversationId] = useState(() => uid('conversation'));

  const messagesRef = useRef<AiMessage[]>([]);

  const countriesQuery = useQuery({
    queryKey: ['ai-countries'],
    queryFn: () => getMedicalCountries(true),
    staleTime: 5 * 60 * 1000,
  });

  const categoriesQuery = useQuery({
    queryKey: ['ai-categories'],
    queryFn: getMedicalCategories,
    staleTime: 5 * 60 * 1000,
  });

  const persistConversation = (
      nextMessages: AiMessage[],
      context?: {
        country?: string;
        category?: string;
      },
  ) => {
    const conversation: AiConversation = {
      id: conversationId,
      countryEn: context?.country ?? selectedCountry,
      symptoms: context?.category ?? selectedCategory,
      messages: nextMessages,
      createdAt: nextMessages[0]?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveAiConversation(conversation);
  };

  const appendMessages = (
      nextItems: AiMessage[],
      context?: {
        country?: string;
        category?: string;
      },
  ) => {
    const nextMessages = [...messagesRef.current, ...nextItems];

    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    persistConversation(nextMessages, context);
  };

  const recommendationMutation = useMutation({
    mutationFn: ({
                   country,
                   category,
                 }: {
      country: string;
      category: string;
    }) => getAiRecommendation(country, category),

    onSuccess: (answer, variables) => {
      const assistantMessage = createMessage('assistant', answer);

      appendMessages([assistantMessage], {
        country: variables.country,
        category: variables.category,
      });
    },
  });

  const chatMutation = useMutation({
    mutationFn: (text: string) => answerAiQuestion(text),

    onSuccess: (answer) => {
      const assistantMessage = createMessage('assistant', answer);
      appendMessages([assistantMessage]);
    },
  });

  const canAskRecommendation =
      Boolean(selectedCountry) &&
      Boolean(selectedCategory) &&
      !recommendationMutation.isPending;

  const canSendChatMessage =
      Boolean(chatInput.trim()) && !chatMutation.isPending;

  const handleAskRecommendation = () => {
    const country = selectedCountry.trim();
    const category = selectedCategory.trim();

    if (!country || !category || recommendationMutation.isPending) {
      return;
    }

    recommendationMutation.reset();

    const userMessage = createMessage(
        'user',
        `Страна: ${country}\nКатегория / симптом: ${category}`,
    );

    appendMessages([userMessage], {
      country,
      category,
    });

    recommendationMutation.mutate({
      country,
      category,
    });
  };

  const handleSendChatMessage = () => {
    const text = chatInput.trim();

    if (!text || chatMutation.isPending) {
      return;
    }

    chatMutation.reset();

    const userMessage = createMessage('user', text);

    appendMessages([userMessage]);
    setChatInput('');

    chatMutation.mutate(text);
  };

  const isAnyAnswerPending =
      recommendationMutation.isPending || chatMutation.isPending;

  return (
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Контекст запроса
            </h2>
            <p className="text-sm text-muted">
              Выберите страну и категорию препарата. Ассистент сформирует
              справочную рекомендацию на основе выбранного контекста.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert
                title="Дисклеймер"
                tone="warning"
                description="Ответ носит информационный характер и не заменяет консультацию врача. При тревожных симптомах обратитесь за очной медицинской помощью."
            />

            {countriesQuery.isError ? (
                <Alert
                    title="Не удалось загрузить страны"
                    tone="danger"
                    description={extractErrorMessage(countriesQuery.error)}
                />
            ) : null}

            {categoriesQuery.isError ? (
                <Alert
                    title="Не удалось загрузить категории"
                    tone="danger"
                    description={extractErrorMessage(categoriesQuery.error)}
                />
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Страна
              </label>

              <Select
                  value={selectedCountry}
                  onChange={(event) => setSelectedCountry(event.target.value)}
                  disabled={countriesQuery.isLoading}
              >
                <option value="">
                  {countriesQuery.isLoading
                      ? 'Загружаем страны...'
                      : 'Выберите страну'}
                </option>

                {(countriesQuery.data ?? []).map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Категория мед. препарата / симптом
              </label>

              <Select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  disabled={categoriesQuery.isLoading}
              >
                <option value="">
                  {categoriesQuery.isLoading
                      ? 'Загружаем категории...'
                      : 'Выберите категорию'}
                </option>

                {(categoriesQuery.data ?? []).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                ))}
              </Select>

              <p className="text-xs text-muted">
                Выберите значение из справочника. Свободный текст можно отправить
                в правом блоке AI-чата.
              </p>
            </div>

            {recommendationMutation.isError ? (
                <Alert
                    title="Не удалось получить рекомендацию"
                    tone="danger"
                    description={extractErrorMessage(recommendationMutation.error)}
                />
            ) : null}

            <Button
                type="button"
                className="w-full"
                onClick={handleAskRecommendation}
                disabled={!canAskRecommendation}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {recommendationMutation.isPending
                  ? 'Формируем рекомендацию...'
                  : 'Спросить у ассистента'}
            </Button>
          </CardContent>
        </Card>

        <Card className="min-h-[620px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">AI-чат</h2>
              <p className="text-sm text-muted">
                Свободный диалог с ассистентом. Здесь можно задать уточняющий
                вопрос без выбора страны и категории.
              </p>
            </div>

            <Sparkles className="h-5 w-5 text-primary" />
          </CardHeader>

          <CardContent className="flex h-[520px] flex-col gap-4">
            <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
              {!messages.length ? (
                  <div className="flex h-full items-center justify-center text-center text-sm text-muted">
                    Начните диалог: выберите контекст слева или отправьте свободный
                    вопрос в поле ниже. История текущей переписки сохранится
                    локально в браузере.
                  </div>
              ) : null}

              {messages.map((message) => (
                  <div
                      key={message.id}
                      className={
                        message.role === 'assistant'
                            ? 'mr-10 rounded-2xl bg-white p-4 shadow-sm'
                            : 'ml-10 rounded-2xl bg-sky-600 p-4 text-white'
                      }
                  >
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                      {message.role === 'assistant' ? 'AI Assistant' : 'Вы'}
                    </div>

                    <div className="whitespace-pre-wrap text-sm leading-6">
                      {message.content}
                    </div>
                  </div>
              ))}

              {isAnyAnswerPending ? (
                  <div className="mr-10 rounded-2xl bg-white p-4 text-sm text-muted shadow-sm">
                    Формируется ответ...
                  </div>
              ) : null}
            </div>

            <div className="space-y-3">
              {chatMutation.isError ? (
                  <Alert
                      title="Не удалось получить ответ"
                      tone="danger"
                      description={extractErrorMessage(chatMutation.error)}
                  />
              ) : null}

              <div className="flex gap-3">
                <Input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Напишите вопрос ассистенту..."
                    disabled={chatMutation.isPending}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                />

                <Button
                    type="button"
                    onClick={handleSendChatMessage}
                    disabled={!canSendChatMessage}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {chatMutation.isPending ? 'Отправляем...' : 'Отправить'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}