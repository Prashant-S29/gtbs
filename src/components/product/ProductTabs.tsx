"use client";

import { useState } from "react";
import { CheckCircle, FileText, PackageOpen } from "lucide-react";
import type { Product, ProductSpecification } from "@/types/product";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeProduct } from "@/lib/localizedProduct";
import type { TranslationKey } from "@/lib/storefrontI18n";

interface ProductTabsProps {
  product: Product;
}

type ProductTab = "overview" | "specs";

const tabs = [
  { id: "overview", labelKey: "product.overviewTab", icon: PackageOpen },
  { id: "specs", labelKey: "product.specificationsTab", icon: FileText },
] as const satisfies ReadonlyArray<{
  id: ProductTab;
  labelKey: TranslationKey;
  icon: typeof PackageOpen;
}>;

function getSpecifications(product: Product): ProductSpecification[] {
  if (product.specifications?.length) return product.specifications;
  return [
    product.publisher ? { name: "Publisher", value: product.publisher } : null,
    product.publishedDate
      ? { name: "Publication date", value: product.publishedDate }
      : null,
    product.pages ? { name: "Pages", value: String(product.pages) } : null,
    product.language ? { name: "Language", value: product.language } : null,
    product.isbn ? { name: "ISBN", value: product.isbn } : null,
    product.dimensions
      ? { name: "Dimensions", value: product.dimensions }
      : null,
  ].filter((item): item is ProductSpecification => item !== null);
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const { language, t } = useLanguage();
  const localizedProduct = localizeProduct(product, language);
  const usesStoredGujarati = language === "gu" && Boolean(product.gujarati);
  const [activeTab, setActiveTab] = useState<ProductTab>("overview");
  const specifications = usesStoredGujarati
    ? localizedProduct.specifications || []
    : getSpecifications(localizedProduct);

  return (
    <div className="mt-14">
      <div className="flex overflow-x-auto border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              <Icon size={17} />
              <span>{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-8">
        {activeTab === "overview" && (
          <div className="max-w-4xl space-y-6 text-gray-700">
            <div>
              <h3 className="title mb-3 text-xl font-bold text-gray-900">
                {t("product.overview")}
              </h3>
              <p
                className={`description text-base leading-relaxed text-gray-600 ${usesStoredGujarati ? "notranslate" : ""}`}
                translate={usesStoredGujarati ? "no" : undefined}
                lang={usesStoredGujarati ? "gu" : undefined}
              >
                {localizedProduct.synopsis ||
                  localizedProduct.description ||
                  t("product.noOverview")}
              </p>
            </div>

            {localizedProduct.features &&
              localizedProduct.features.length > 0 && (
                <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-6">
                  <h4 className="title mb-3 text-base font-bold text-orange-950">
                    {t("product.highlights")}
                  </h4>
                  <ul
                    className={`space-y-2.5 text-sm text-gray-700 ${usesStoredGujarati ? "notranslate" : ""}`}
                    translate={usesStoredGujarati ? "no" : undefined}
                    lang={usesStoredGujarati ? "gu" : undefined}
                  >
                    {localizedProduct.features.map((feature, index) => (
                      <li
                        key={`${feature}-${index}`}
                        className="flex items-start gap-2.5"
                      >
                        <CheckCircle
                          size={17}
                          className="mt-0.5 shrink-0 text-orange-600"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {activeTab === "specs" && (
          <div className="max-w-3xl">
            <h3 className="title mb-5 text-xl font-bold text-gray-900">
              {t("product.specifications")}
            </h3>
            {specifications.length ? (
              <div
                className={`divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white ${usesStoredGujarati ? "notranslate" : ""}`}
                translate={usesStoredGujarati ? "no" : undefined}
                lang={usesStoredGujarati ? "gu" : undefined}
              >
                {specifications.map((specification, index) => (
                  <div
                    key={`${specification.name}-${index}`}
                    className={`grid grid-cols-1 p-4 text-sm sm:grid-cols-2 ${index % 2 === 0 ? "bg-gray-50/50" : ""}`}
                  >
                    <span className="font-semibold text-gray-500">
                      {specification.name}
                    </span>
                    <span className="text-gray-900">{specification.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                {t("product.noSpecifications")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
