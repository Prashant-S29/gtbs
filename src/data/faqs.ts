import type { TranslationKey } from "@/lib/storefrontI18n";

export interface FaqItem {
  questionKey: TranslationKey;
  answerKey: TranslationKey;
}

type FaqSection = "home" | "about" | "contact" | "gallery" | "blogs" | "shop";

function createFaqs(section: FaqSection, count: number): FaqItem[] {
  return Array.from({ length: count }, (_, index) => {
    const prefix = `faqContent.${section}.item${index + 1}`;
    return {
      questionKey: `${prefix}.question` as TranslationKey,
      answerKey: `${prefix}.answer` as TranslationKey,
    };
  });
}

export const homeFaqs = createFaqs("home", 5);
export const aboutFaqs = createFaqs("about", 5);
export const contactFaqs = createFaqs("contact", 5);
export const galleryFaqs = createFaqs("gallery", 5);
export const blogsFaqs = createFaqs("blogs", 4);
export const shopFaqs = createFaqs("shop", 4);
