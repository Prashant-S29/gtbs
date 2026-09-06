"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  SlidersHorizontal,
  BookOpen,
  X,
  RotateCcw,
  ChevronDown,
  Filter,
} from "lucide-react";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { shopFaqs } from "@/data/faqs";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumb from "@/components/common/Breadcrumb";
import Faq from "@/components/common/Faq";
import SearchBar from "@/components/common/SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeProduct } from "@/lib/localizedProduct";
import { localizeCategory } from "@/lib/localizedCategory";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

interface AllProductsContentProps {
  initialCategory: string;
  initialCollection: string;
  initialSearch: string;
  products: Product[];
  categories: Category[];
}

function AllProductsContent({
  initialCategory,
  initialCollection,
  initialSearch,
  products,
  categories,
}: AllProductsContentProps) {
  const { language, t } = useLanguage();
  // Filters: Category, Price Range, Collections
  const [selectedCategory, setSelectedCategory] = useState(() =>
    initialCategory === "all" ||
    categories.some((category) => category.slug === initialCategory)
      ? initialCategory
      : "all",
  );
  const [priceRange, setPriceRange] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState(() =>
    ["all", "bestseller", "new", "trending", "accessories"].includes(
      initialCollection,
    )
      ? initialCollection
      : "all",
  );
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  // Prevent background scroll when mobile filter modal is open
  useEffect(() => {
    if (!isMobileFilterOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileFilterOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileFilterOpen]);

  const selectCategory = (value: string) => {
    setSelectedCategory(value);
    setVisibleCount(8);
  };
  const selectPriceRange = (value: string) => {
    setPriceRange(value);
    setVisibleCount(8);
  };
  const selectCollection = (value: string) => {
    setSelectedCollection(value);
    setVisibleCount(8);
  };
  const updateSearchQuery = useCallback((value: string) => {
    setSearchQuery(value);
    setVisibleCount(8);
  }, []);
  const selectSort = (value: SortOption) => {
    setSortBy(value);
    setVisibleCount(8);
  };

  // Category list with accurate item counts
  const categoryList = useMemo(() => {
    const allCount = products.length;
    const list = categories.map((sourceCategory) => {
      const cat = localizeCategory(sourceCategory, language);
      const count = products.filter(
        (p) => p.category.toLowerCase() === cat.slug.toLowerCase(),
      ).length;
      return { ...cat, count };
    });
    return [
      { id: "all", name: "All Genres", slug: "all", count: allCount },
      ...list,
    ];
  }, [categories, language, products]);

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const localizedProduct = localizeProduct(p, language);
      // 1. Category Filter
      const matchesCat =
        selectedCategory === "all" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      // 2. Price Range Filter
      let matchesPrice = true;
      if (priceRange === "under-300") matchesPrice = p.price < 300;
      else if (priceRange === "300-600")
        matchesPrice = p.price >= 300 && p.price <= 600;
      else if (priceRange === "600-1000")
        matchesPrice = p.price >= 600 && p.price <= 1000;
      else if (priceRange === "above-1000") matchesPrice = p.price > 1000;

      // 3. Collections Filter
      let matchesCollection = true;
      if (selectedCollection === "bestseller") {
        matchesCollection = p.badge?.toLowerCase().includes("best") ?? false;
      } else if (selectedCollection === "new") {
        matchesCollection = p.badge?.toLowerCase().includes("new") ?? false;
      } else if (selectedCollection === "trending") {
        matchesCollection =
          p.badge?.toLowerCase().includes("popular") ||
          p.badge?.toLowerCase().includes("trend") ||
          p.badge?.toLowerCase().includes("sale") ||
          (p.rating && p.rating >= 4.5)
            ? true
            : false;
      } else if (selectedCollection === "accessories") {
        matchesCollection =
          p.category.toLowerCase() === "accessories" ||
          (p.badge?.toLowerCase().includes("accessor") ?? false);
      }

      // Search Query
      const matchesSearch =
        searchQuery.trim() === "" ||
        localizedProduct.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (p.author || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (localizedProduct.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesPrice && matchesCollection && matchesSearch;
    });

    // Sorting
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [
    selectedCategory,
    priceRange,
    selectedCollection,
    searchQuery,
    sortBy,
    products,
    language,
  ]);

  const activeFilterCount = [
    selectedCategory !== "all",
    priceRange !== "all",
    selectedCollection !== "all",
    searchQuery.trim() !== "",
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const resetAllFilters = () => {
    setSelectedCategory("all");
    setPriceRange("all");
    setSelectedCollection("all");
    setSearchQuery("");
    setSortBy("featured");
    setVisibleCount(8);
  };

  const breadcrumbItems = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.products") },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-10">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-6 mt-4">
        <h1 className="title text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {t("catalog.browseTitle")}
        </h1>
        <p className="description mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          {t("catalog.browseDescription")}
        </p>
      </div>

      {/* Mobile Top Action Toolbar */}
      <div className="mb-5 flex flex-col gap-3 lg:hidden">
        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 shadow-sm active:scale-95 transition-all description shrink-0"
          >
            <Filter size={15} className="text-orange-600" />
            <span>{t("catalog.filters")}</span>
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Search Field (Mobile) */}
          <div className="relative flex-1">
            <SearchBar
              value={searchQuery}
              onChange={updateSearchQuery}
              onSearch={updateSearchQuery}
              debounceMs={300}
              size="sm"
              placeholder={t("catalog.searchBooks")}
            />
          </div>
        </div>

        {/* Sort & Count Row (Mobile) */}
        <div className="flex items-center justify-between px-1 text-xs text-gray-500">
          <span>
            {t("catalog.booksFound", {
              count: filteredAndSortedProducts.length,
            })}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="description text-gray-400">
              {t("catalog.sort")}
            </span>
            <select
              aria-label={t("catalog.sortProducts")}
              value={sortBy}
              onChange={(e) => selectSort(e.target.value as SortOption)}
              className="rounded-lg border border-gray-200 bg-white py-1 px-2 text-xs font-semibold text-gray-700 focus:border-orange-500 focus:outline-none description"
            >
              <option value="featured">{t("catalog.featured")}</option>
              <option value="rating">{t("catalog.topRated")}</option>
              <option value="price-asc">{t("catalog.priceLowHigh")}</option>
              <option value="price-desc">{t("catalog.priceHighLow")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Sidebar (3 Filters) + Right Catalog */}
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12 items-start">
        {/* ================= SIDEBAR (Desktop >= 1024px) ================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
            {/* Sidebar Title */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-orange-600" />
                <h2 className="title text-base font-bold text-gray-900">
                  {t("catalog.filters")}
                </h2>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 description tracking-wide transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>{t("catalog.reset")}</span>
                </button>
              )}
            </div>

            {/* 1. Category / Genre Filter */}
            <div className="py-4 border-b border-gray-100">
              <h3 className="title text-sm font-bold text-gray-900 mb-3">
                {t("catalog.category")}
              </h3>

              <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
                {categoryList.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => selectCategory(cat.slug)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium description tracking-wide transition-all ${
                        isSelected
                          ? "bg-orange-600 text-white font-semibold shadow-sm"
                          : "text-gray-700 hover:bg-orange-50/70 hover:text-orange-600"
                      }`}
                    >
                      <span
                        className={`truncate ${language === "gu" && cat.gujarati ? "notranslate" : ""}`}
                      >
                        {cat.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Price Range Filter */}
            <div className="py-4 border-b border-gray-100">
              <h3 className="title text-sm font-bold text-gray-900 mb-3">
                {t("catalog.priceRange")}
              </h3>

              <div className="space-y-1.5">
                {[
                  { id: "all", label: t("catalog.allPrices") },
                  { id: "under-300", label: t("catalog.under300") },
                  { id: "300-600", label: t("catalog.range300600") },
                  { id: "600-1000", label: t("catalog.range6001000") },
                  { id: "above-1000", label: t("catalog.above1000") },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 text-xs description tracking-wide text-gray-700 cursor-pointer hover:text-orange-600 py-1"
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange === item.id}
                      onChange={() => selectPriceRange(item.id)}
                      className="accent-orange-600 h-4 w-4 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Curated Collections Filter */}
            <div className="pt-4">
              <h3 className="title text-sm font-bold text-gray-900 mb-3">
                {t("catalog.collections")}
              </h3>

              <div className="space-y-1.5">
                {[
                  { id: "all", label: t("catalog.allCollections") },
                  { id: "bestseller", label: t("home.best.title") },
                  { id: "new", label: t("home.new.title") },
                  { id: "trending", label: t("home.trending.title") },
                  { id: "accessories", label: t("catalog.accessories") },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 text-xs description tracking-wide text-gray-700 cursor-pointer hover:text-orange-600 py-1"
                  >
                    <input
                      type="radio"
                      name="collectionFilter"
                      checked={selectedCollection === item.id}
                      onChange={() => selectCollection(item.id)}
                      className="accent-orange-600 h-4 w-4 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT CATALOG AREA ================= */}
        <section
          aria-label={t("catalog.productResults")}
          className="col-span-12 lg:col-span-9"
        >
          {/* Top Control Bar (Desktop) */}
          <div className="mb-6 hidden lg:flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={updateSearchQuery}
                onSearch={updateSearchQuery}
                debounceMs={300}
                size="sm"
                placeholder={t("catalog.searchDetailed")}
              />
            </div>

            {/* Results Count & Sort Dropdown */}
            <div className="flex items-center justify-end gap-4">
              <span className="text-xs text-gray-500 description">
                {t("catalog.showingBooks", {
                  count: filteredAndSortedProducts.length,
                })}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 description">
                  {t("catalog.sort")}
                </span>
                <select
                  aria-label={t("catalog.sortProducts")}
                  value={sortBy}
                  onChange={(e) => selectSort(e.target.value as SortOption)}
                  className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 focus:border-orange-500 focus:outline-none description tracking-wide cursor-pointer"
                >
                  <option value="featured">{t("catalog.featured")}</option>
                  <option value="rating">{t("catalog.topRated")}</option>
                  <option value="price-asc">{t("catalog.priceLowHigh")}</option>
                  <option value="price-desc">
                    {t("catalog.priceHighLow")}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="mb-5 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs text-gray-500 description font-medium">
                {t("catalog.active")}
              </span>

              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-orange-700 description">
                  {t("catalog.genreChip", { value: selectedCategory })}
                  <button
                    type="button"
                    onClick={() => selectCategory("all")}
                    className="hover:text-orange-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {priceRange !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-orange-700 description">
                  {t("catalog.priceChip", { value: priceRange })}
                  <button
                    type="button"
                    onClick={() => selectPriceRange("all")}
                    className="hover:text-orange-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedCollection !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-orange-700 description">
                  {t("catalog.collectionChip", {
                    value:
                      selectedCollection === "new"
                        ? t("home.new.title")
                        : selectedCollection === "bestseller"
                          ? t("home.best.title")
                          : selectedCollection === "accessories"
                            ? t("catalog.accessories")
                            : t("home.trending.title"),
                  })}
                  <button
                    type="button"
                    onClick={() => selectCollection("all")}
                    className="hover:text-orange-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-orange-700 description">
                  {t("catalog.queryChip", { value: searchQuery })}
                  <button
                    type="button"
                    onClick={() => updateSearchQuery("")}
                    className="hover:text-orange-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={resetAllFilters}
                className="text-[11px] sm:text-xs text-orange-600 hover:underline font-semibold description ml-1"
              >
                {t("catalog.clearAll")}
              </button>
            </div>
          )}

          {/* Book Catalog Grid & Pagination */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="py-16 sm:py-20 text-center rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="title text-lg sm:text-xl font-bold text-gray-800">
                {t("catalog.noBooksTitle")}
              </h3>
              <p className="description text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                {t("catalog.noBooksDescription")}
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-orange-700 active:scale-95"
              >
                <RotateCcw size={14} />
                <span>{t("catalog.resetAll")}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-10">
              <ProductGrid
                products={filteredAndSortedProducts.slice(0, visibleCount)}
                className="grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 lg:gap-6"
              />

              {/* View More Pagination */}
              {visibleCount < filteredAndSortedProducts.length ? (
                <div className="flex flex-col items-center justify-center gap-3 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2.5 text-xs text-gray-500 description tracking-wide">
                    <span>
                      {t("catalog.showingOf", {
                        visible: Math.min(
                          visibleCount,
                          filteredAndSortedProducts.length,
                        ),
                        total: filteredAndSortedProducts.length,
                      })}
                    </span>
                    <div className="h-1.5 w-24 sm:w-28 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-orange-600 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (visibleCount / filteredAndSortedProducts.length) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + 8)}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 sm:px-7 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition-all duration-200 hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/30 active:scale-[0.98] description tracking-wide"
                  >
                    <span>{t("catalog.viewMore")}</span>
                    <ChevronDown
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-y-0.5"
                    />
                  </button>
                </div>
              ) : filteredAndSortedProducts.length > 8 ? (
                <div className="pt-6 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400 description tracking-wide">
                    {t("catalog.viewedAll", {
                      count: filteredAndSortedProducts.length,
                    })}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>

      {/* ================= MOBILE / TABLET FILTER DRAWER ================= */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm lg:hidden transition-opacity">
          {/* Backdrop Click to Close */}
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="relative z-10 ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl sm:max-w-sm"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-orange-600" />
                <h3
                  id="mobile-filter-title"
                  className="title text-base sm:text-lg font-bold text-gray-900"
                >
                  {t("catalog.filterBooks")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label={t("catalog.closeFilters")}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              {/* 1. Category */}
              <div>
                <h4 className="title text-xs sm:text-sm font-bold text-gray-900 mb-2.5">
                  {t("catalog.categoryGenre")}
                </h4>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  {categoryList.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => selectCategory(cat.slug)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium description transition-colors ${
                        selectedCategory === cat.slug
                          ? "bg-orange-600 text-white font-semibold shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span
                        className={`truncate ${language === "gu" && cat.gujarati ? "notranslate" : ""}`}
                      >
                        {cat.name}
                      </span>
                      <span
                        className={`text-[10px] rounded-full px-2 py-0.5 ${
                          selectedCategory === cat.slug
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Price Range */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="title text-xs sm:text-sm font-bold text-gray-900 mb-2.5">
                  {t("catalog.priceRange")}
                </h4>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: "all", label: t("catalog.allPrices") },
                    { id: "under-300", label: t("catalog.under300") },
                    { id: "300-600", label: t("catalog.range300600") },
                    { id: "600-1000", label: t("catalog.range6001000") },
                    { id: "above-1000", label: t("catalog.above1000") },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 text-gray-700 cursor-pointer py-1"
                    >
                      <input
                        type="radio"
                        name="mPriceRange"
                        checked={priceRange === item.id}
                        onChange={() => selectPriceRange(item.id)}
                        className="accent-orange-600 h-4 w-4"
                      />
                      <span className="description">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Collections */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="title text-xs sm:text-sm font-bold text-gray-900 mb-2.5">
                  {t("catalog.collections")}
                </h4>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: "all", label: t("catalog.allCollections") },
                    { id: "bestseller", label: t("home.best.title") },
                    { id: "new", label: t("home.new.title") },
                    { id: "trending", label: t("home.trending.title") },
                    { id: "accessories", label: t("catalog.accessories") },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 text-gray-700 cursor-pointer py-1"
                    >
                      <input
                        type="radio"
                        name="mCollectionFilter"
                        checked={selectedCollection === item.id}
                        onChange={() => selectCollection(item.id)}
                        className="accent-orange-600 h-4 w-4"
                      />
                      <span className="description">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions in Drawer */}
            <div className="border-t border-gray-100 p-4 bg-gray-50 flex gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 description"
              >
                {t("catalog.resetAll")}
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 rounded-xl bg-orange-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-orange-700 description"
              >
                {t("catalog.showBooks", {
                  count: filteredAndSortedProducts.length,
                })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="mt-14 sm:mt-20 border-t border-gray-100 pt-8 sm:pt-12">
        <div className="bg-orange-50/70 rounded-3xl p-5 sm:p-8 md:p-10 border border-orange-100/80 shadow-sm max-w-5xl mx-auto">
          <Faq
            faqs={shopFaqs}
            badgeKey="catalog.faq.badge"
            titleKey="catalog.faq.title"
            subtitleKey="catalog.faq.subtitle"
          />
        </div>
      </div>
    </div>
  );
}

export default function AllProductsPageClient({
  initialCategory,
  initialCollection,
  initialSearch,
  products,
  categories,
}: {
  initialCategory: string;
  initialCollection: string;
  initialSearch: string;
  products: Product[];
  categories: Category[];
}) {
  return (
    <AllProductsContent
      initialCategory={initialCategory}
      initialCollection={initialCollection}
      initialSearch={initialSearch}
      products={products}
      categories={categories}
    />
  );
}
