'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type AdminLang = 'ar' | 'en';

interface AdminDictionary {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export const ADMIN_TRANSLATIONS: AdminDictionary = {
  adminSaas: { ar: 'لوحة الإدارة الآمنة', en: 'ADMIN SAAS' },
  platformName: { ar: 'منصة فعاليات الإيزيديين حول العالم', en: 'Ezidi Events Platform' },
  superAdmin: { ar: 'المشرف الأعلى', en: 'Super Admin' },
  twoFactorActive: { ar: 'التحقق الثنائي نشط', en: '2FA ACTIVE' },
  overview: { ar: 'نظرة عامة', en: 'Overview' },
  allEvents: { ar: 'جميع الفعاليات', en: 'All Events' },
  submissionsQueue: { ar: 'طابور الطلبات الجديدة', en: 'Submissions Queue' },
  sensitiveEdits: { ar: 'مراجعة التعديلات الحساسة', en: 'Sensitive Edits Diff' },
  organizationsDirectPub: { ar: 'المنظمات والنشر المباشر', en: 'Organizations & Direct Pub' },
  communityReports: { ar: 'بلاغات المجتمع', en: 'Community Reports' },
  usersRoles: { ar: 'المستخدمين والصلاحيات', en: 'Users & Roles' },
  categories: { ar: 'تصنيفات الفعاليات', en: 'Event Categories' },
  countriesCities: { ar: 'الدول والمدن', en: 'Countries & Cities' },
  mediaStorage: { ar: 'الوسائط والتخزين', en: 'Media & Storage' },
  auditTrail: { ar: 'سجل التدقيق الأمني', en: 'Audit Trail' },
  settings: { ar: 'إعدادات المنصة', en: 'Platform Settings' },
  publicWebsite: { ar: 'الموقع العام', en: 'Public Website' },
  signOut: { ar: 'تسجيل الخروج', en: 'Sign Out' },
  language: { ar: 'اللغة', en: 'Language' },
  
  // Dashboard Home
  adminHeading: { ar: 'لوحة الرقابة والإدارة الإدارية', en: 'Administrative Oversight Panel' },
  adminSubheading: { ar: 'طوابير المراجعة الفورية، توثيق المنظمات، وسجل تدقيق النظام الأمني.', en: 'Real-time moderation queues, organization verification, and system audit stream.' },
  reviewSubmissions: { ar: 'مراجعة الطلبات', en: 'Review Submissions' },
  publishedEvents: { ar: 'الفعاليات المنشورة', en: 'PUBLISHED EVENTS' },
  pendingSubmissions: { ar: 'طلبات قيد المراجعة', en: 'PENDING SUBMISSIONS' },
  sensitiveEditsCount: { ar: 'تعديلات حساسة معلقة', en: 'SENSITIVE EDITS DIFF' },
  openReports: { ar: 'بلاغات مفتوحة', en: 'OPEN REPORTS' },
  incomingSubmissions: { ar: 'الفعاليات الجديدة الواردة', en: 'Incoming Event Submissions' },
  orgVerificationQueue: { ar: 'طابور توثيق المنظمات', en: 'Organization Verification Queue' },
  recentAuditTrail: { ar: 'سجل تدقيق النظام الأخير (سجل غير قابل للحذف)', en: 'Recent System Audit Trail (Append-Only)' },
  reviewAll: { ar: 'مراجعة الكل', en: 'Review All' },
  manageAll: { ar: 'إدارة الكل', en: 'Manage All' },
  fullAuditExplorer: { ar: 'مستكشف سجل التدقيق الكامل', en: 'Full Audit Explorer' },
  moderate: { ar: 'مراجعة وقرار', en: 'Moderate' },
  inspect: { ar: 'فحص التوثيق', en: 'Inspect' },
  verified: { ar: 'موثقة', en: 'Verified' },
  pending: { ar: 'قيد الانتظار', en: 'Pending' },
  timestamp: { ar: 'الوقت والتاريخ', en: 'TIMESTAMP' },
  actorRole: { ar: 'رتبة الفاعل', en: 'ACTOR ROLE' },
  action: { ar: 'الإجراء الأمني', en: 'ACTION' },
  entityType: { ar: 'نوع الكيان', en: 'ENTITY TYPE' },
  reasonDetails: { ar: 'السبب / التفاصيل', en: 'REASON / DETAILS' },
};

interface AdminLanguageContextType {
  lang: AdminLang;
  setLang: (lang: AdminLang) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const AdminLanguageContext = createContext<AdminLanguageContextType>({
  lang: 'ar',
  setLang: () => {},
  t: (key: string) => key,
  isRtl: true,
});

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('ezidi_admin_lang') as AdminLang;
    if (saved === 'ar' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: AdminLang) => {
    setLangState(newLang);
    localStorage.setItem('ezidi_admin_lang', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    if (ADMIN_TRANSLATIONS[key]) {
      return ADMIN_TRANSLATIONS[key][lang] || ADMIN_TRANSLATIONS[key].en;
    }
    return key;
  };

  const isRtl = lang === 'ar';

  return (
    <AdminLanguageContext.Provider value={{ lang, setLang, t, isRtl }}>
      <div dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'font-sans' : ''}>
        {children}
      </div>
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  return useContext(AdminLanguageContext);
}
