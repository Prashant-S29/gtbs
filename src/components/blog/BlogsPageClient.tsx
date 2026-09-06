"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ArrowRight, BookOpen, ChevronDown } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { blogsFaqs } from "@/data/faqs";
import Faq from "@/components/common/Faq";
import SearchBar from "@/components/common/SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeBlog } from "@/lib/localizedBlog";

export default function BlogsPageClient({
  initialItems,
}: {
  initialItems: BlogPost[];
}) {
  const { language, t } = useLanguage();
  const blogItems = initialItems;
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
    () => ["All", ...new Set(blogItems.map((blog) => blog.category))],
    [blogItems],
  );

  const filteredBlogs = blogItems.filter((blog) => {
    const localizedBlog = localizeBlog(blog, language);
    const matchesCategory =
      selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      localizedBlog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      localizedBlog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header Banner */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3.5 py-1 text-sm font-semibold description tracking-wide text-orange-700 mb-3">
          <BookOpen size={16} />
          <span>{t("blog.badge")}</span>
        </div>
        <h1 className="title text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
          {t("blog.title")}
        </h1>
        <p className="description mt-3 text-sm md:text-base text-gray-600">
          {t("blog.description")}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => {
            const categoryLabel =
              cat === "All"
                ? t("blog.all")
                : localizeBlog(
                    blogItems.find((blog) => blog.category === cat)!,
                    language,
                  ).category;
            const categoryHasStoredGujarati =
              language === "gu" &&
              (cat === "All" ||
                Boolean(
                  blogItems.find((blog) => blog.category === cat)?.gujarati,
                ));
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
                  className={
                    categoryHasStoredGujarati ? "notranslate" : undefined
                  }
                  translate={categoryHasStoredGujarati ? "no" : undefined}
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
            placeholder={t("blog.search")}
          />
        </div>
      </div>

      {/* Blog Cards Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-gray-100 bg-white p-8">
          <p className="text-gray-500 description text-sm">{t("blog.empty")}</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.slice(0, visibleCount).map((sourceBlog) => {
              const blog = localizeBlog(sourceBlog, language);
              const localizedAttributes =
                language === "gu" && sourceBlog.gujarati
                  ? { className: "notranslate", translate: "no" as const }
                  : {};
              return (
                <article
                  key={blog.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10"
                >
                  {/* Cover Image */}
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="relative block aspect-[16/10] overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold description tracking-wide text-orange-600 shadow-sm backdrop-blur-sm">
                      <span {...localizedAttributes}>{blog.category}</span>
                    </span>
                  </Link>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2.5 flex items-center gap-4 text-xs text-gray-500 description tracking-wide">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-orange-600" />
                        <span>{blog.date}</span>
                      </div>
                    </div>

                    <Link href={`/blogs/${blog.slug}`}>
                      <h3
                        className={`${localizedAttributes.className ?? ""} line-clamp-2 title text-lg font-semibold text-gray-900 transition-colors group-hover:text-orange-600`}
                        translate={localizedAttributes.translate}
                      >
                        {blog.title}
                      </h3>
                    </Link>

                    <p
                      className={`${localizedAttributes.className ?? ""} description mt-2 text-sm tracking-wide text-gray-600 line-clamp-2`}
                      translate={localizedAttributes.translate}
                    >
                      {blog.summary}
                    </p>

                    {/* Author footer */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3.5 mt-3.5">
                      <div className="flex items-center gap-2.5">
                        <Image
                          src={blog.author.avatar}
                          alt={blog.author.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span
                          className={`${localizedAttributes.className ?? ""} text-xs font-semibold description tracking-wide text-gray-800`}
                          translate={localizedAttributes.translate}
                        >
                          {blog.author.name}
                        </span>
                      </div>

                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="flex items-center gap-1 text-xs font-semibold tracking-wide description text-orange-600 hover:text-orange-700"
                      >
                        <span>{t("blog.read")}</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* View More Pagination */}
          {visibleCount < filteredBlogs.length ? (
            <div className="flex flex-col items-center justify-center gap-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2.5 text-xs text-gray-500 description tracking-wide">
                <span>
                  {t("blog.showing", {
                    visible: Math.min(visibleCount, filteredBlogs.length),
                    total: filteredBlogs.length,
                  })}
                </span>
                <div className="h-1.5 w-24 sm:w-28 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-orange-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (visibleCount / filteredBlogs.length) * 100,
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
                <span>{t("blog.viewMore")}</span>
                <ChevronDown
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-y-0.5"
                />
              </button>
            </div>
          ) : filteredBlogs.length > 6 ? (
            <div className="pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 description tracking-wide">
                {t("blog.viewedAll", { count: filteredBlogs.length })}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Blogs & Journal FAQ Section */}
      <div className="mt-20 border-t border-gray-100 pt-12">
        <div className="bg-orange-50/70 rounded-3xl p-6 sm:p-10 border border-orange-100/80 shadow-sm max-w-5xl mx-auto">
          <Faq
            faqs={blogsFaqs}
            badgeKey="blog.faq.badge"
            titleKey="blog.faq.title"
            subtitleKey="blog.faq.subtitle"
          />
        </div>
      </div>
    </div>
  );
}
