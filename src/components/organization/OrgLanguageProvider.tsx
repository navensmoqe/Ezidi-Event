'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type OrgLang = 'ar' | 'en';

interface OrgLanguageContextType {
  lang: OrgLang;
  setLang: (lang: OrgLang) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const orgDictionary: Record<OrgLang, Record<string, string>> = {
  ar: {
    // Navigation
    portalName: 'بوابة المنظمات المعتمدة',
    platformName: 'منصة فعاليات الإيزيديين حول العالم',
    dashboard: 'لوحة التحكم العامة',
    myEvents: 'فعاليات المنظمة',
    addEvent: 'إضافة فعالية جديدة',
    orgProfile: 'ملف وبيانات المنظمة',
    members: 'فريق العمل والأعضاء',
    mediaGallery: 'معرض الوسائط والشعارات',
    analytics: 'الإحصائيات والتحليلات',
    settings: 'إعدادات الحساب والأمان',
    publicWebsite: 'زيارة الموقع العام',
    logout: 'تسجيل الخروج',

    // Status & Badges
    directPublishing: 'صلاحية النشر المباشر',
    directPubActive: 'مفعّل (نشر فوري دون مراجعة)',
    directPubDisabled: 'معطّل (يتطلب مراجعة المشرف)',
    verifiedOrg: 'منظمة موثقة رسمياً',
    pendingVerification: 'قيد التدقيق والمراجعة',
    activeStatus: 'نشط',

    // Dashboard Cards
    publishedEvents: 'الفعاليات المنشورة',
    pendingReview: 'قيد مراجعة الإدارة',
    pendingChanges: 'تعديلات قيد التدقيق',
    estimatedViews: 'المشاهدات والوصول',
    publishNewEventBtn: 'نشر فعالية جديدة',
    recentEvents: 'أحدث فعاليات المنظمة',
    noEventsYet: 'لم تقم المنظمة بنشر أي فعاليات بعد.',
    exploreAllEvents: 'عرض كافة الفعاليات',

    // Login & Quick Access
    instantDirectAccess: '⚡ الدخول المباشر السريع (بدون كلمة مرور)',
    chooseYourOrg: 'اختر منظمتك للدخول الفوري:',
    enterDashboardBtn: 'دخول فوري إلى لوحة المنظمة',
    orLoginWithCredentials: 'أو تسجيل الدخول بالبريد وكلمة المرور',
    officialEmail: 'البريد الإلكتروني الرسمي',
    password: 'كلمة المرور',
    signInBtn: 'تسجيل الدخول',
    authenticating: 'جاري التحقق والدخول...',
    dontHaveOrg: 'ليس لديك منظمة مسجلة؟',
    registerOrgLink: 'قدّم طلب تسجيل منظمة جديدة الآن',
  },
  en: {
    // Navigation
    portalName: 'Verified Organization Portal',
    platformName: 'Ezidi Events Worldwide',
    dashboard: 'Dashboard',
    myEvents: 'My Events',
    addEvent: 'Publish New Event',
    orgProfile: 'Organization Profile',
    members: 'Members & Roles',
    mediaGallery: 'Media Gallery',
    analytics: 'Analytics & Reach',
    settings: 'Settings & Security',
    publicWebsite: 'Public Website',
    logout: 'Sign Out',

    // Status & Badges
    directPublishing: 'Direct Publishing',
    directPubActive: 'Active (Instant Live)',
    directPubDisabled: 'Disabled (Requires Review)',
    verifiedOrg: 'Verified NGO',
    pendingVerification: 'Pending Verification',
    activeStatus: 'Active',

    // Dashboard Cards
    publishedEvents: 'Published Events',
    pendingReview: 'Pending Review',
    pendingChanges: 'Pending Changes',
    estimatedViews: 'Estimated Reach',
    publishNewEventBtn: 'Publish New Event',
    recentEvents: 'Recent Organization Events',
    noEventsYet: 'No events published by this organization yet.',
    exploreAllEvents: 'View All Events',

    // Login & Quick Access
    instantDirectAccess: '⚡ Instant 1-Click Access (No Password Required)',
    chooseYourOrg: 'Select your organization for instant access:',
    enterDashboardBtn: 'Instant Access to Organization Portal',
    orLoginWithCredentials: 'Or Sign in with Email and Password',
    officialEmail: 'Official Contact Email',
    password: 'Password',
    signInBtn: 'Sign In to Dashboard',
    authenticating: 'Authenticating...',
    dontHaveOrg: "Don't have a registered organization?",
    registerOrgLink: 'Submit an organization application now',
  },
};

const OrgLanguageContext = createContext<OrgLanguageContextType | undefined>(undefined);

export function OrgLanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<OrgLang>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('ezidi_org_lang') as OrgLang | null;
    if (saved && (saved === 'ar' || saved === 'en')) {
      setLangState(saved);
      document.documentElement.setAttribute('lang', saved);
      document.documentElement.setAttribute('dir', saved === 'ar' ? 'rtl' : 'ltr');
    } else {
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
    }
  }, []);

  const setLang = (newLang: OrgLang) => {
    setLangState(newLang);
    localStorage.setItem('ezidi_org_lang', newLang);
    document.documentElement.setAttribute('lang', newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  };

  const t = (key: string): string => {
    return orgDictionary[lang]?.[key] || orgDictionary.en[key] || key;
  };

  const isRtl = lang === 'ar';

  return (
    <OrgLanguageContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </OrgLanguageContext.Provider>
  );
}

export function useOrgLanguage() {
  const context = useContext(OrgLanguageContext);
  if (!context) {
    throw new Error('useOrgLanguage must be used within an OrgLanguageProvider');
  }
  return context;
}
