import "server-only";

import { z } from "zod";

export const gujaratiSuggestionModes = ["translate", "transliterate"] as const;
export type GujaratiSuggestionMode = (typeof gujaratiSuggestionModes)[number];

const AZURE_TRANSLATOR_ENDPOINT =
  "https://api.cognitive.microsofttranslator.com";
const PROVIDER_TIMEOUT_MS = 10_000;

const translatedResponseSchema = z.array(
  z.object({
    translations: z.array(z.object({ text: z.string().min(1) })).min(1),
  }),
);
const transliteratedResponseSchema = z.array(
  z.object({ text: z.string().min(1) }),
);

export class AzureTranslatorConfigurationError extends Error {}

export function isAzureTranslatorConfigured() {
  return Boolean(process.env.AZURE_TRANSLATOR_KEY?.trim());
}

function translatorConfiguration() {
  const key = process.env.AZURE_TRANSLATOR_KEY?.trim();
  if (!key) {
    throw new AzureTranslatorConfigurationError(
      "Gujarati suggestions are not configured.",
    );
  }

  return {
    key,
    region: process.env.AZURE_TRANSLATOR_REGION?.trim(),
  };
}

function requestUrl(mode: GujaratiSuggestionMode) {
  if (mode === "transliterate") {
    return `${AZURE_TRANSLATOR_ENDPOINT}/transliterate?api-version=3.0&language=gu&fromScript=Latn&toScript=Gujr`;
  }
  return `${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&from=en&to=gu`;
}

export async function suggestGujarati(
  texts: string[],
  mode: GujaratiSuggestionMode,
) {
  const configuration = translatorConfiguration();
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=UTF-8",
    "Ocp-Apim-Subscription-Key": configuration.key,
  };
  if (configuration.region) {
    headers["Ocp-Apim-Subscription-Region"] = configuration.region;
  }

  const response = await fetch(requestUrl(mode), {
    method: "POST",
    headers,
    body: JSON.stringify(texts.map((text) => ({ Text: text }))),
    cache: "no-store",
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error("Azure Translator rejected the suggestion request.");
  }

  const payload: unknown = await response.json();
  const suggestions =
    mode === "translate"
      ? translatedResponseSchema
          .parse(payload)
          .map((item) => item.translations[0].text)
      : transliteratedResponseSchema.parse(payload).map((item) => item.text);

  if (suggestions.length !== texts.length) {
    throw new Error("Azure Translator returned an incomplete response.");
  }
  return suggestions;
}
