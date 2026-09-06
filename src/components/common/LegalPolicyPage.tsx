"use client";

import Link from "next/link";
import {
  Clock,
  FileCheck2,
  Mail,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/storefrontI18n";

type PolicyName = "privacy" | "terms" | "shipping";

const policyConfig = {
  privacy: { icon: ShieldCheck, sections: 13, contactSection: 13 },
  terms: { icon: FileCheck2, sections: 18, contactSection: 18 },
  shipping: { icon: Truck, sections: 14, contactSection: 13 },
} satisfies Record<
  PolicyName,
  { icon: typeof ShieldCheck; sections: number; contactSection: number }
>;

export default function LegalPolicyPage({ policy }: { policy: PolicyName }) {
  const { t } = useLanguage();
  const config = policyConfig[policy];
  const Icon = config.icon;
  const key = (suffix: string) =>
    `policies.${policy}.${suffix}` as TranslationKey;
  const title = t(key("title"));

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-4xl px-4 pt-8 lg:px-6">
        <Breadcrumb
          items={[{ label: t("nav.home"), href: "/" }, { label: title }]}
          className="mb-0"
        />
      </div>

      <header className="border-b border-orange-100 bg-orange-50/70">
        <div className="container mx-auto px-4 py-12 text-center md:py-16 lg:px-6">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-orange-700 shadow-sm ring-1 ring-orange-100">
            <Icon size={16} />
            {t(key("badge"))}
          </span>
          <h1 className="title text-3xl font-extrabold text-gray-900 md:text-5xl">
            {title}
          </h1>
          <p className="description mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            {t(key("description"))}
          </p>
          <p className="description mt-3 text-xs font-medium text-gray-500">
            {t("policies.common.effective")}
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12 lg:px-6">
        <div className="description border-b border-gray-200 pb-8 text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
          <p>{t(key("intro"))}</p>
          {policy !== "shipping" && (
            <p className="mt-3 font-medium text-gray-800">
              {t(key("agreement"))}
            </p>
          )}
        </div>

        {Array.from({ length: config.sections }, (_, index) => {
          const sectionNumber = index + 1;
          const isSummary = policy === "shipping" && sectionNumber === 14;
          const isContact = sectionNumber === config.contactSection;

          return (
            <section
              key={sectionNumber}
              className={
                isSummary
                  ? "mt-10 border-y border-orange-200 bg-orange-50/70 px-5 py-8 sm:px-8"
                  : "border-b border-gray-200 py-8 last:border-b-0 md:py-10"
              }
            >
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
                  {sectionNumber}
                </span>
                <h2 className="title pt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                  {t(key(`sections.section${sectionNumber}.title`))}
                </h2>
              </div>
              <div className="description text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
                <p>{t(key(`sections.section${sectionNumber}.body`))}</p>

                {policy === "terms" && sectionNumber === 15 && (
                  <Link
                    href="/privacy-policy"
                    className="mt-3 inline-flex font-semibold text-orange-600 underline decoration-orange-200 underline-offset-4 transition-colors hover:text-orange-700"
                  >
                    {t("footer.privacy")}
                  </Link>
                )}

                {isContact && (
                  <div className="mt-5 border-l-2 border-orange-500 pl-5">
                    <p className="font-semibold text-gray-900">
                      {t("policies.common.store")}
                    </p>
                    <div className="mt-3 flex flex-col gap-3">
                      <Link
                        href="mailto:support@gtbsbooks.com"
                        className="flex items-center gap-2 text-gray-700 transition-colors hover:text-orange-600"
                      >
                        <Mail size={17} className="text-orange-600" />
                        support@gtbsbooks.com
                      </Link>
                      <Link
                        href="tel:+919265429330"
                        className="flex items-center gap-2 text-gray-700 transition-colors hover:text-orange-600"
                      >
                        <Phone size={17} className="text-orange-600" />
                        +91 92654 29330
                      </Link>
                      {policy !== "terms" && (
                        <p className="flex items-center gap-2 text-gray-700">
                          <Clock size={17} className="text-orange-600" />
                          {t("policies.common.hours")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
