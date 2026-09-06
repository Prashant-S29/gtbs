"use client";

import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
  allProducts: Product[];
}

export default function RelatedProducts({
  currentProductId,
  category,
  allProducts,
}: RelatedProductsProps) {
  const { t } = useLanguage();
  const related = allProducts
    .filter((p) => p.id !== currentProductId)
    .sort(
      (a, b) =>
        Number(b.category === category) - Number(a.category === category),
    )
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-gray-100 pt-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="title text-2xl font-bold text-gray-900 md:text-3xl">
            {t("product.related")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("product.relatedDescription")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
