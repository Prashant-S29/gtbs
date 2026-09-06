import english from "@/data/english.json";
import gujarati from "@/data/gujarati.json";

const translations = {
  en: english,
  gu: gujarati,
};

export type StorefrontLanguage = keyof typeof translations;
type StringLeafPaths<T> = {
  [Key in keyof T & string]: T[Key] extends string
    ? Key
    : T[Key] extends Record<string, unknown>
      ? `${Key}.${StringLeafPaths<T[Key]>}`
      : never;
}[keyof T & string];

export type TranslationKey = StringLeafPaths<(typeof translations)["en"]>;
export type TranslationParams = Record<string, string | number>;

function readTranslation(dictionary: unknown, key: TranslationKey) {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, dictionary);

  return typeof value === "string" ? value : undefined;
}

function collectTranslationKeys(
  dictionary: Record<string, unknown>,
  prefix = "",
): TranslationKey[] {
  return Object.entries(dictionary).flatMap(([segment, value]) => {
    const path = prefix ? `${prefix}.${segment}` : segment;
    return typeof value === "string"
      ? [path as TranslationKey]
      : collectTranslationKeys(value as Record<string, unknown>, path);
  });
}

export function translateStorefront(
  language: StorefrontLanguage,
  key: TranslationKey,
  params: TranslationParams = {},
) {
  const template =
    readTranslation(translations[language], key) ??
    readTranslation(translations.en, key) ??
    key;

  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

export function getTranslationKeys(language: StorefrontLanguage) {
  return collectTranslationKeys(translations[language]).sort();
}
