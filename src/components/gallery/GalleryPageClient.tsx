"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Camera,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import type { GalleryItem } from "@/types/gallery";
import { galleryFaqs } from "@/data/faqs";
import Faq from "@/components/common/Faq";
import SearchBar from "@/components/common/SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeGallery } from "@/lib/localizedGallery";

export default function GalleryPageClient({
  initialItems,
}: {
  initialItems: GalleryItem[];
}) {
  const { language, t } = useLanguage();
  const galleryItems = initialItems;
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const selectCategory = (value: string) => {
    setSelectedCategory(value);
    setVisibleCount(6);
  };
  const updateSearchQuery = useCallback((value: string) => {
    setSearchQuery(value);
    setVisibleCount(6);
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(galleryItems.map((gallery) => gallery.category))],
    [galleryItems],
  );

  const filteredGalleries = galleryItems.filter((item) => {
    const localizedItem = localizeGallery(item, language);
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      localizedItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      localizedItem.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      localizedItem.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3.5 py-1 text-sm font-semibold text-orange-600 mb-3 description">
          <Sparkles size={14} />
          <span>{t("gallery.badge")}</span>
        </div>
        <h1 className="title text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
          {t("gallery.title")}
        </h1>
        <p className="description mt-3 text-sm md:text-base text-gray-600">
          {t("gallery.description")}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => {
            const categorySource =
              galleryItems.find(
                (gallery) =>
                  gallery.category === cat &&
                  (language !== "gu" || gallery.gujarati),
              ) ?? galleryItems.find((gallery) => gallery.category === cat);
            const categoryLabel =
              cat === "All"
                ? t("gallery.all")
                : localizeGallery(categorySource!, language).category;
            const usesStoredGujarati =
              language === "gu" &&
              (cat === "All" || Boolean(categorySource?.gujarati));

            return (
              <button
                key={cat}
                type="button"
                onClick={() => selectCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium description tracking-wide transition-all ${
                  selectedCategory === cat
                    ? "bg-orange-600 text-white shadow-sm font-semibold"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span
                  className={usesStoredGujarati ? "notranslate" : undefined}
                  translate={usesStoredGujarati ? "no" : undefined}
                >
                  {categoryLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <SearchBar
            value={searchQuery}
            onChange={updateSearchQuery}
            onSearch={updateSearchQuery}
            debounceMs={300}
            size="sm"
            placeholder={t("gallery.search")}
          />
        </div>
      </div>

      {/* Gallery Album Cards Grid */}
      {filteredGalleries.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-gray-100 bg-white p-8">
          <p className="text-gray-500 description text-sm">
            {t("gallery.empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {filteredGalleries.slice(0, visibleCount).map((sourceAlbum) => {
              const album = localizeGallery(sourceAlbum, language);
              const localizedAttributes =
                language === "gu" && sourceAlbum.gujarati
                  ? { className: "notranslate", translate: "no" as const }
                  : {};

              return (
                <article
                  key={album.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10"
                >
                  {/* Cover Image & Badges */}
                  <Link
                    href={`/gallery/${album.slug}`}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={album.coverImage}
                      alt={album.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <span className="absolute left-4 top-4 rounded-full bg-orange-600 px-3.5 py-1 pb-1.5 text-xs font-semibold tracking-wide text-white shadow-sm description">
                      <span {...localizedAttributes}>{album.category}</span>
                    </span>

                    <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 pt-1 pb-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-sm shadow-sm description">
                      <Camera size={14} />
                      <span>
                        {t("gallery.photos", { count: album.photos.length })}
                      </span>
                    </span>
                  </Link>

                  {/* Album Content */}
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-orange-600" />
                        <p className="text-xs description tracking-wide">
                          {album.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-orange-600" />
                        <p
                          className={`${localizedAttributes.className ?? ""} text-xs description tracking-wide`}
                          translate={localizedAttributes.translate}
                        >
                          {album.location}
                        </p>
                      </div>
                    </div>

                    <Link href={`/gallery/${album.slug}`}>
                      <h2
                        className={`${localizedAttributes.className ?? ""} title text-xl sm:text-2xl font-bold text-gray-900 transition-colors group-hover:text-orange-600`}
                        translate={localizedAttributes.translate}
                      >
                        {album.title}
                      </h2>
                    </Link>

                    <p
                      className={`${localizedAttributes.className ?? ""} description mt-2.5 tracking-wide text-sm text-gray-600 line-clamp-2 leading-relaxed`}
                      translate={localizedAttributes.translate}
                    >
                      {album.description}
                    </p>

                    {/* Action Button */}
                    <div className="mt-auto pt-5 border-t border-gray-100">
                      <Link
                        href={`/gallery/${album.slug}`}
                        className="flex items-center justify-between description tracking-wide font-semibold text-xs sm:text-sm text-orange-600 group-hover:text-orange-700"
                      >
                        <span>{t("gallery.viewCollection")}</span>
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* View More Pagination */}
          {visibleCount < filteredGalleries.length ? (
            <div className="flex flex-col items-center justify-center gap-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2.5 text-xs text-gray-500 description tracking-wide">
                <span>
                  {t("gallery.showing", {
                    visible: Math.min(visibleCount, filteredGalleries.length),
                    total: filteredGalleries.length,
                  })}
                </span>
                <div className="h-1.5 w-24 sm:w-28 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-orange-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (visibleCount / filteredGalleries.length) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + 6)}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 sm:px-7 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition-all duration-200 hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/30 active:scale-[0.98] description tracking-wide"
              >
                <span>{t("gallery.viewMore")}</span>
                <ChevronDown
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-y-0.5"
                />
              </button>
            </div>
          ) : filteredGalleries.length > 6 ? (
            <div className="pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 description tracking-wide">
                {t("gallery.viewedAll", { count: filteredGalleries.length })}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Gallery FAQ Section */}
      <div className="mt-20 border-t border-gray-100 pt-12">
        <div className="bg-orange-50/70 rounded-3xl p-6 sm:p-10 border border-orange-100/80 shadow-sm max-w-5xl mx-auto">
          <Faq
            faqs={galleryFaqs}
            badgeKey="gallery.faq.badge"
            titleKey="gallery.faq.title"
            subtitleKey="gallery.faq.subtitle"
          />
        </div>
      </div>
    </div>
  );
}
