"use client";

import { BookOpen, MessageCircle, Truck, WalletCards } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/storefrontI18n";

const features = [
  {
    icon: BookOpen,
    titleKey: "home.features.collection.title",
    descriptionKey: "home.features.collection.description",
  },
  {
    icon: Truck,
    titleKey: "home.features.delivery.title",
    descriptionKey: "home.features.delivery.description",
  },
  {
    icon: MessageCircle,
    titleKey: "home.features.whatsapp.title",
    descriptionKey: "home.features.whatsapp.description",
  },
  {
    icon: WalletCards,
    titleKey: "home.features.prices.title",
    descriptionKey: "home.features.prices.description",
  },
] satisfies Array<{
  icon: typeof BookOpen;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}>;

const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-6">
      <div className="container px-3 lg:px-6">
        <div className="overflow-hidden bg-[#fffaf0] rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className={`
                  group h-full px-5 py-6
                  sm:px-6
                  lg:px-7 lg:py-1
                  ${index > 0 ? "lg:border-l lg:border-gray-200" : ""}
                `}
                >
                  {/* Icon */}
                  <div className="mb-5">
                    <Icon
                      size={38}
                      strokeWidth={1.4}
                      className="text-orange-500 transition-transform duration-300 group-hover:-translate-y-1"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="title text-[21px] font-medium leading-tight text-gray-900">
                    {t(feature.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="description mt-2 text-[15px] leading-[1.55] text-gray-600">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
