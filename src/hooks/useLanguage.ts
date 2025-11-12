'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import viTranslations from '@/locales/vi.json';
import enTranslations from '@/locales/en.json';

type Language = 'vi' | 'en';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, any> = {
  vi: viTranslations,
  en: enTranslations,
};

export const useLanguage = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'vi',
      setLanguage: (lang: Language) => set({ language: lang }),
      t: (key: string) => {
        const { language } = get();
        const keys = key.split('.');
        let value: any = translations[language];
        
        for (const k of keys) {
          value = value?.[k];
        }
        
        return value || key;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);