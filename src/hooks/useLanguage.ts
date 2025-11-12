// src/hooks/useLanguage.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import viTranslations from '@/locales/vi.json';
import enTranslations from '@/locales/en.json';
import { useEffect, useState } from 'react';

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

// Internal store
const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'vi', // Default to Vietnamese
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

// Hook with SSR safety
export const useLanguage = () => {
  const store = useLanguageStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return Vietnamese by default on server
  if (!isClient) {
    return {
      language: 'vi' as Language,
      setLanguage: () => {},
      t: (key: string) => {
        const keys = key.split('.');
        let value: any = viTranslations;
        
        for (const k of keys) {
          value = value?.[k];
        }
        
        return value || key;
      },
    };
  }

  return store;
};

// Alternative: Hook that forces client-side only
export const useClientLanguage = () => {
  const [mounted, setMounted] = useState(false);
  const store = useLanguageStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    ...store,
    mounted,
  };
};