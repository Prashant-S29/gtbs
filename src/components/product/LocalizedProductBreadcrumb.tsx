"use client";

import Breadcrumb from "@/components/common/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeProduct } from "@/lib/localizedProduct";
import type { Product } from "@/types/product";

export default function LocalizedProductBreadcrumb({
  product,
}: {
  product: Product;
}) {
  const { language, t } = useLanguage();
  const localizedProduct = localizeProduct(product, language);
  const usesStoredGujarati = language === "gu" && Boolean(product.gujarati);

  return (
    <div lang={usesStoredGujarati ? "gu" : undefined}>
      <Breadcrumb
        items={[
          {
            label: t("product.home"),
            href: "/",
            skipTranslation: usesStoredGujarati,
          },
          {
            label: t("product.products"),
            href: "/allproducts",
            skipTranslation: usesStoredGujarati,
          },
          {
            label: product.category,
            href: `/allproducts?category=${product.category}`,
          },
          {
            label: localizedProduct.title,
            skipTranslation: usesStoredGujarati,
          },
        ]}
      />
    </div>
  );
}
