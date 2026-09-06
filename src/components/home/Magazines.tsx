"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { Product } from "@/types/product";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeProduct } from "@/lib/localizedProduct";

interface MagazinesProps {
  products: Product[];
}

export default function Magazines({ products }: MagazinesProps) {
  const { language, t } = useLanguage();
  const magazineItems = products.slice(0, 3).map((product) => {
    const localized = localizeProduct(product, language);
    return {
      id: product.id,
      title: localized.title,
      description: localized.description || localized.synopsis,
      image: product.image,
      price: product.price,
      badge: product.badge,
      href: `/product/${product.id}`,
    };
  });

  return (
    <section className="bg-white py-10">
      <div className="container px-3 lg:px-6">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="title text-3xl font-semibold text-orange-600 sm:text-4xl">
              {t("home.magazines.title")}
            </h2>
            <p className="description mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-[15px]">
              {t("home.magazines.description")}
            </p>
          </div>

          <Link
            href="/allproducts?category=magazines"
            className="description hidden shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:border-orange-600 hover:text-orange-600 sm:flex"
          >
            {t("action.viewAll")}
            <ArrowRight size={16} />
          </Link>
        </div>

        {magazineItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {magazineItems.map((magazine, index) => (
              <Link
                href={magazine.href}
                key={magazine.id}
                className="group relative flex flex-row items-stretch overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-orange-200 hover:shadow-[0_12px_28px_-6px_rgba(234,88,12,0.12)]"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex flex-1 flex-col justify-between bg-white p-5 sm:p-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      {magazine.badge && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
                          <BookOpen
                            size={13}
                            className="text-orange-600"
                            aria-hidden="true"
                          />
                          {magazine.badge}
                        </span>
                      )}
                      {magazine.price > 0 && (
                        <span className="ml-auto rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-900">
                          &#8377;{magazine.price}
                        </span>
                      )}
                    </div>

                    <h3 className="title line-clamp-2 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-orange-600 sm:text-xl">
                      {magazine.title}
                    </h3>
                    {magazine.description && (
                      <p className="description mt-2 line-clamp-3 text-xs leading-relaxed text-gray-500 sm:text-[13px]">
                        {magazine.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center text-xs font-semibold text-orange-600 transition-all duration-300 group-hover:text-orange-700 sm:text-sm">
                      <span>{t("action.viewDetails")}</span>
                      <ArrowRight
                        size={15}
                        className="ml-1.5 transition-transform duration-300 group-hover:translate-x-1.5"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative w-[38%] min-w-[120px] shrink-0 overflow-hidden bg-gray-100 sm:w-[42%] sm:min-w-[150px]">
                  <Image
                    src={magazine.image}
                    alt={magazine.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 18vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-orange-600/0 transition-colors duration-300 group-hover:bg-orange-600/10" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">
            {t("home.collection.empty")}
          </p>
        )}

        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/allproducts?category=magazines"
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
