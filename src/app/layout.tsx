import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { AppProviders } from '@/shared/providers/app-providers';
import { SiteHeader } from '@/widgets/header/site-header';
import { SiteFooter } from '@/widgets/footer/site-footer';

export const metadata: Metadata = {
  title: 'Medical Applied',
  description: 'Medical Applied — справочный сервис по лекарственным препаратам',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <AppProviders>
          <div className="min-h-screen bg-background text-foreground">
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">{children}</main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
