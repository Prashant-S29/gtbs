"use client";

import Link from "next/link";
import {
  BookOpen,
  Cross,
  Heart,
  Baby,
  Users,
  BookMarked,
  Sparkles,
  ArrowRight,
  Bookmark,
  TrendingUp,
  Compass,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCategory } from "@/lib/localizedCategory";

// Icon mapping per category slug
const categoryIconMap: Record<string, LucideIcon> = {
  "bible-books": BookOpen,
  "christian-living": Cross,
  devotionals: Heart,
  "self-help": TrendingUp,
  business: Compass,
  kids: Baby,
  biography: Users,
  novels: BookMarked,
};

const CategorySection = ({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) => {
  const { language, t } = useLanguage();

  return (
    <section className="bg-gradient-to-b from-orange-50/50 via-white to-orange-50/30 py-14 md:py-20">
      <div className="container px-3 lg:px-6 mx-auto">
        {/* Section Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3.5 py-1 text-xs sm:text-sm font-semibold description tracking-wide text-orange-700 mb-3">
            <Sparkles size={14} />
            <span>{t("home.categories.badge")}</span>
          </div>

          <h2 className="title text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("home.categories.title")}
          </h2>

          <p className="description mt-3 text-sm sm:text-base leading-relaxed text-gray-600">
            {t("home.categories.description")}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => {
            const localizedCategory = localizeCategory(category, language);
            const usesStoredGujarati =
              language === "gu" && Boolean(category.gujarati);
            const Icon = categoryIconMap[category.slug] || Bookmark;
            const bookCount = products.filter(
              (p) => p.category.toLowerCase() === category.slug.toLowerCase(),
            ).length;

            return (
              <Link
                key={category.id}
                href={`/allproducts?category=${category.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 active:scale-[0.99]"
              >
                {/* Subtle background glow on hover */}
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-500/5 transition-all duration-500 group-hover:scale-[2.5] group-hover:bg-orange-500/10" />

                <div>
                  {/* Top Row: Icon + Count Badge */}
                  <div className="relative mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-600/30">
                      <Icon
                        size={22}
                        strokeWidth={2}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 description tracking-wide transition-colors group-hover:bg-orange-100 group-hover:text-orange-700">
                      {bookCount > 0
                        ? t("home.categories.books", { count: bookCount })
                        : t("home.categories.available")}
                    </span>
                  </div>

                  {/* Category Title */}
                  <h3
                    className={`title text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-orange-600 ${usesStoredGujarati ? "notranslate" : ""}`}
                  >
                    {localizedCategory.name}
                  </h3>
                </div>

                {/* Bottom Action Row */}
                <div className="relative mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm font-semibold description tracking-wide text-gray-500 transition-colors group-hover:text-orange-600">
                    {t("home.categories.browse")}
                  </span>

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white group-hover:translate-x-1">
                    <ArrowRight size={13} />
                  </span>
                </div>

                {/* Animated Bottom Border */}
                <span className="absolute bottom-0 left-0 h-[2.5px] w-0 bg-orange-600 transition-all duration-300 group-hover:w-full" />
              </Link>
            );
          })}
        </div>

        {/* View All Categories CTA Button */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/allproducts"
            className="group inline-flex items-center gap-2.5 rounded-full border border-orange-600 bg-white px-7 py-3 text-sm font-semibold description tracking-wide text-orange-600 shadow-sm transition-all duration-300 hover:bg-orange-600 hover:text-white hover:shadow-lg hover:shadow-orange-600/20 active:scale-95"
          >
            <span>{t("home.categories.viewAll")}</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
