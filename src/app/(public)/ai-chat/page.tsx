'use client';

import Link from 'next/link';
import { useAuthStore } from '@/shared/stores/auth-store';
import { SectionHeader } from '@/shared/ui/section-header';
import { Button } from '@/shared/ui/button';
import { AiChatPanel } from '@/entities/ai/ui/ai-chat-panel';
import {Alert} from "@/shared/ui/alert";

export default function AiChatPage() {
  const identity = useAuthStore((state) => state.identity);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="AI-модуль"
        title="Диалоговый интерфейс AI-ассистента"
        description="Задайте страну и симптом, получите структурированную справочную подсказку и сохраните диалог в браузере."
      />
        <Alert
            title="Важно"
            tone="warning"
            description="AI-ассистент доступен только верифицированным пользователям."
        />
      {!identity ? (
        <div className="rounded-[24px] border border-border bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-foreground">AI-чат доступен после входа</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            После входа вы сможете сформировать запрос, получить ответ и сохранить историю переписки в браузере.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/auth/login">Войти</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/auth/register">Создать аккаунт</Link>
            </Button>
          </div>
        </div>
      ) : (
        <AiChatPanel />
      )}
    </div>
  );
}
