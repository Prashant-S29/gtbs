"use client";

import Image from "next/image";
import {
  BadgeCheck,
  BookOpen,
  CreditCard,
  Headphones,
  RotateCcw,
} from "lucide-react";

import BookstoreImg from "../../../public/images/products/why-choose.webp";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/storefrontI18n";

const benefits = [
  {
    titleKey: "home.why.collection.title",
    descriptionKey: "home.why.collection.description",
    icon: BookOpen,
  },
  {
    titleKey: "home.why.prices.title",
    descriptionKey: "home.why.prices.description",
    icon: BadgeCheck,
  },
  {
    titleKey: "home.why.payments.title",
    descriptionKey: "home.why.payments.description",
    icon: CreditCard,
  },
  {
    titleKey: "home.why.returns.title",
    descriptionKey: "home.why.returns.description",
    icon: RotateCcw,
  },
  {
    titleKey: "home.why.support.title",
    descriptionKey: "home.why.support.description",
    icon: Headphones,
  },
] satisfies Array<{
  icon: typeof BookOpen;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}>;

const WhyChoose = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-12">
      <div className="container px-3 lg:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl">
            <Image
              src={BookstoreImg}
              alt={t("home.why.imageAlt")}
              width={900}
              height={650}
              className="h-[380px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[460px]"
            />
          </div>

          {/* Content */}
          <div>
            {/* Main Heading */}
            <h2 className="title text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl">
              {t("home.why.title")}
            </h2>

            {/* Description */}
            <p className="description mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-[15px]">
              {t("home.why.description")}
            </p>

            {/* Benefits */}
            <div className="mt-7 space-y-5">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.titleKey} className="group flex gap-4">
                    {/* Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white">
                      <Icon size={19} strokeWidth={1.8} />
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className="title text-[17px] font-semibold text-gray-900 transition-colors duration-300 group-hover:text-orange-600">
                        {t(benefit.titleKey)}
                      </h3>

                      <p className="description mt-1 text-sm leading-5 text-gray-500">
                        {t(benefit.descriptionKey)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
