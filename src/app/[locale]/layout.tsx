import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RecoveryHashRedirect } from '@/components/auth/RecoveryHashRedirect';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Ezidi Events Worldwide | Global Directory & Documentation Platform',
  description:
    'The international platform dedicated to documenting, publishing, discovering, and verifying Ezidi/Yazidi demonstrations, rallies, vigils, memorial conferences, and cultural events worldwide.',
  keywords: [
    'Ezidi events',
    'Yazidi events',
    'Sinjar memorial',
    'Yazidi genocide recognition',
    'Ezidi cultural gatherings',
    'solidarity rallies',
    'Lalish',
  ],
  authors: [{ name: 'Ezidi Events Worldwide Platform' }],
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className="dark">
      <body className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <RecoveryHashRedirect />
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
