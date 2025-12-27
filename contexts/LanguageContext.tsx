"use client";

/**
 * LanguageContext
 * 
 * Manages language state (es/en) across the application.
 * Features:
 * - Detects browser language automatically
 * - Persists user choice to localStorage
 * - Provides translation helper hook
 * 
 * @module contexts/LanguageContext
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translations, type TranslationKey } from "@/lib/translations";

export type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "language-preference";

/**
 * Detects browser language preference
 * Returns "en" if browser language starts with "en", otherwise "es"
 */
function getBrowserLanguage(): Language {
  if (typeof window === "undefined") return "es";
  
  const browserLang = navigator.language || (navigator as any).userLanguage || "es";
  return browserLang.toLowerCase().startsWith("en") ? "en" : "es";
}

/**
 * Gets stored language from localStorage or falls back to browser detection
 */
function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "es";
  
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "es" || stored === "en") {
    return stored;
  }
  
  // Detect from browser if no preference stored
  return getBrowserLanguage();
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [mounted, setMounted] = useState(false);

  // Initialize language on mount
  useEffect(() => {
    setLanguageState(getInitialLanguage());
    setMounted(true);
  }, []);

  // Update document lang attribute and save to localStorage
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    
    try {
      if (document.documentElement) {
        document.documentElement.lang = language;
      }
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error("Error applying language:", error);
    }
  }, [language, mounted]);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "es" ? "en" : "es"));
  }, []);

  /**
   * Translation function
   * Returns the translated string for the given key in the current language
   */
  const t = useCallback((key: TranslationKey): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Return key if translation not found
        console.warn(`Translation not found for key: ${key}`);
        return key;
      }
    }
    
    return typeof value === "string" ? value : key;
  }, [language]);

  // Always provide context, even before mount, to prevent errors
  // The language will be applied once mounted
  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export { LanguageContext };

