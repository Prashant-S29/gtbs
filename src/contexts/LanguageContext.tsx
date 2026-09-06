"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  translateStorefront,
  type TranslationKey,
  type TranslationParams,
} from "@/lib/storefrontI18n";

type AppLanguage = "en" | "gu";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const LANGUAGE_STORAGE_KEY = "gtbs-language";
const LANGUAGE_CHANGE_EVENT = "gtbs-language-change";
const LEGACY_CONSENT_STORAGE_KEY = "gtbs-cookie-consent";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getLanguageSnapshot(): AppLanguage {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return savedLanguage === "gu" ? "gu" : "en";
}

function subscribeToLanguageChange(callback: () => void) {
  window.addEventListener(LANGUAGE_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function clearLegacyGoogleTranslateCookie() {
  const expiredCookie =
    "googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax";
  document.cookie = expiredCookie;

  if (window.location.hostname !== "localhost") {
    document.cookie = `${expiredCookie};domain=${window.location.hostname}`;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    getLanguageSnapshot,
    (): AppLanguage => "en",
  );

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) =>
      translateStorefront(language, key, params),
    [language],
  );

  useEffect(() => {
    window.localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY);
    document.cookie =
      "gtbs_cookie_consent=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax";
    clearLegacyGoogleTranslateCookie();
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
