"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FaqItem } from "@/data/faqs";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/storefrontI18n";

interface FaqProps {
  faqs: FaqItem[];
  title?: string;
  subtitle?: string;
  badge?: string;
  titleKey?: TranslationKey;
  subtitleKey?: TranslationKey;
  badgeKey?: TranslationKey;
  className?: string;
}

const Faq = ({
  faqs,
  title = "Frequently Asked Questions",
  subtitle = "Find quick answers to common questions about our books, orders, and services.",
  badge,
  titleKey,
  subtitleKey,
  badgeKey,
  className = "",
}: FaqProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useLanguage();
  const resolvedTitle = titleKey ? t(titleKey) : title;
  const resolvedSubtitle = subtitleKey ? t(subtitleKey) : subtitle;
  const resolvedBadge = badgeKey ? t(badgeKey) : badge;

  return (
    <div className={`w-full ${className}`}>
      {/* Heading */}
      <div className="mb-6">
        {resolvedBadge && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1 text-xs font-semibold text-orange-700 mb-2 description tracking-wide">
            <HelpCircle size={14} />
            <span>{resolvedBadge}</span>
          </span>
        )}
        <h2 className="title text-2xl font-bold tracking-tight text-gray-900 md:text-[28px]">
          {resolvedTitle}
        </h2>
        {resolvedSubtitle && (
          <p className="description mt-1.5 text-sm text-gray-600">
            {resolvedSubtitle}
          </p>
        )}
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={faq.questionKey}
              className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? "border-orange-200 bg-orange-50/40 shadow-sm"
                  : "border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="title text-base font-semibold text-gray-900">
                  {t(faq.questionKey)}
                </span>

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isOpen
                      ? "bg-orange-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="description px-5 pb-5 pr-10 text-sm leading-relaxed text-gray-600">
                    {t(faq.answerKey)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Faq;
