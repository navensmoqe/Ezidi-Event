import React from 'react';
import '@/app/globals.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="min-h-screen bg-[#070A10] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
