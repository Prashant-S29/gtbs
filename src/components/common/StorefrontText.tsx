"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey, TranslationParams } from "@/lib/storefrontI18n";

export default function StorefrontText({
  translationKey,
  params,
}: {
  translationKey: TranslationKey;
  params?: TranslationParams;
}) {
  const { t } = useLanguage();

  return <>{t(translationKey, params)}</>;
}
