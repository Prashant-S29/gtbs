"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/storefrontI18n";

interface ProductCarouselSectionProps {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  href: string;
  products: Product[];
  background?: string;
}

export default function ProductCarouselSection({
  titleKey,
  descriptionKey,
  href,
  products,
  background = "bg-white",
}: ProductCarouselSectionProps) {
  const { t } = useLanguage();
  const title = t(titleKey);
  const listRef = useRef<HTMLUListElement>(null);
  const scroll = (direction: -1 | 1) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({
      left: direction * list.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className={`${background} py-10`}>
      <div className="container px-3 lg:px-6">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="title text-3xl font-semibold text-orange-600 sm:text-4xl">
              {title}
            </h2>
            <p className="description mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-[15px]">
              {t(descriptionKey)}
            </p>
          </div>
          <Link
            href={href}
            className="description hidden shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:border-orange-600 hover:text-orange-600 sm:flex"
          >
            {t("action.viewAll")}
            <ArrowRight size={16} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="relative">
            <ul
              ref={listRef}
              aria-label={title}
              className="grid snap-x snap-mandatory grid-flow-col auto-cols-[87%] gap-[18px] overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[480px]:auto-cols-[58%] sm:auto-cols-[42%] sm:gap-5 md:auto-cols-[31%] lg:auto-cols-[23%] lg:gap-6 xl:auto-cols-[18.5%]"
            >
              {products.map((product) => (
                <li key={product.id} className="min-w-0 snap-start">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label={t("home.collection.previous", { title })}
              className="absolute -left-5 top-[38%] z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg hover:border-orange-600 hover:text-orange-600 lg:grid"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label={t("home.collection.next", { title })}
              className="absolute -right-5 top-[38%] z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg hover:border-orange-600 hover:text-orange-600 lg:grid"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">
            {t("home.collection.empty")}
          </p>
        )}

        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href={href}
            className="description flex items-center gap-2 rounded-full border border-orange-600 px-6 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-600 hover:text-white"
          >
            {t("action.viewAll")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
