"use client";

import { BookOpen, Tag, Truck, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/storefrontI18n";

const benefits = [
  {
    icon: BookOpen,
    titleKey: "about.why.selection.title",
    descriptionKey: "about.why.selection.description",
  },
  {
    icon: Tag,
    titleKey: "about.why.prices.title",
    descriptionKey: "about.why.prices.description",
  },
  {
    icon: Truck,
    titleKey: "about.why.delivery.title",
    descriptionKey: "about.why.delivery.description",
  },
  {
    icon: Headphones,
    titleKey: "about.why.support.title",
    descriptionKey: "about.why.support.description",
  },
] satisfies Array<{
  icon: typeof BookOpen;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}>;

const WhyChooseUs = () => {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="why-choose-us-heading" className="bg-white py-10">
      <div className="container mx-auto px-4 lg:px-6">
        {/* ================= SECTION HEADING ================= */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange-600 md:text-xs">
            {t("about.why.badge")}
          </p>

          <h2
            id="why-choose-us-heading"
            className="title mt-3 text-[30px] font-bold leading-tight tracking-tight text-gray-900 sm:text-[34px] md:text-[40px]"
          >
            {t("about.why.title")}
          </h2>
        </div>

        {/* ================= BENEFITS ================= */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.titleKey}
                className="group flex min-h-[250px] flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-orange-100 hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)]"
              >
                {/* Icon */}
                <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-orange-50 transition-all duration-300 group-hover:bg-orange-100">
                  <Icon
                    size={38}
                    strokeWidth={1.7}
                    className="text-orange-600 transition-transform duration-300 group-hover:scale-105"
                    aria-hidden="true"
                  />
                </div>

                {/* Title */}
                <h3 className="title mt-7 text-[18px] font-bold text-gray-900">
                  {t(benefit.titleKey)}
                </h3>

                {/* Description */}
                <p className="description mt-3 max-w-[230px] text-[14px] leading-6 text-gray-500 md:text-sm">
                  {t(benefit.descriptionKey)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
