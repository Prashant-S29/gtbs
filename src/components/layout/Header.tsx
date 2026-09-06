"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Phone,
  ShoppingCart,
  ChevronDown,
  Headset,
  Languages,
  Menu,
  X,
  ChevronRight,
  Check,
} from "lucide-react";

import Logo from "../../../public/images/logo/logo.webp";
import SearchBar from "@/components/common/SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  markCartAsViewed,
  useCart,
  useCartNotification,
} from "@/lib/storefrontStorage";
import { localizeCategory } from "@/lib/localizedCategory";
import type { Category } from "@/types/category";

function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { itemCount: cartItemCount } = useCart();
  const hasUnreadCartChanges = useCartNotification();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // Mobile/tablet dropdowns must work with tap/click, not only hover.
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const languageRef = useRef<HTMLDivElement>(null);

  // Close header dropdowns when clicking outside.
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (languageRef.current && !languageRef.current.contains(target)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (pathname === "/cart" && hasUnreadCartChanges) {
      markCartAsViewed();
    }
  }, [hasUnreadCartChanges, pathname]);

  /* =========================================================
     NAVIGATION ITEMS
  ========================================================= */

  const menuItems = [
    {
      name: t("nav.home"),
      href: "/",
      sectionId: null,
    },
    {
      name: t("nav.products"),
      href: "/allproducts",
      sectionId: null,
    },
    {
      name: t("nav.about"),
      href: "/about",
      sectionId: null,
    },
    {
      name: t("nav.gallery"),
      href: "/gallery",
      sectionId: null,
    },
    {
      name: t("nav.blogs"),
      href: "/blogs",
      sectionId: null,
    },
    {
      name: t("nav.contact"),
      href: "/contact",
      sectionId: null,
    },
  ];

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string | null,
  ) => {
    if (pathname === "/" && sectionId) {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  const navigationCategories = categories.map((category) => ({
    ...category,
    name: localizeCategory(category, language).name,
    href: `/allproducts?category=${category.slug}`,
    usesStoredGujarati: language === "gu" && Boolean(category.gujarati),
  }));

  /* =========================================================
     ACTIVE CHECK
  ========================================================= */

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  /* =========================================================
     CLOSE SIDEBAR
  ========================================================= */

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <header className="w-full bg-white">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="h-10 overflow-hidden bg-black">
        <div className="container mx-auto px-3 lg:px-6 flex h-full items-center justify-between">
          {/* ================= EMAIL + PHONE ================= */}

          <div className="flex items-center gap-4 sm:gap-5">
            {/* Email */}

            <Link
              href="mailto:support@gtbsbooks.com"
              title={t("common.emailUs")}
              aria-label={t("common.emailUs")}
              className="flex items-center gap-2 text-sm leading-none text-white transition-colors duration-200 hover:text-amber-400"
            >
              <Mail className="h-4 w-4 shrink-0" />

              <span className="hidden sm:inline">support@gtbsbooks.com</span>
            </Link>

            {/* Divider */}

            <span className="h-5 w-px bg-white/40" />

            {/* Phone */}

            <div className="flex items-center gap-2 text-sm leading-none text-white">
              <Phone className="h-4 w-4 shrink-0" />

              <Link
                href="tel:+919265429338"
                title={t("common.callNumber", { number: "+91 9265429338" })}
                aria-label={t("common.callNumber", {
                  number: "+91 9265429338",
                })}
                className="transition-colors duration-200 hover:text-amber-400"
              >
                +91 9265429338
              </Link>

              <span className="hidden text-white/40 md:inline">|</span>

              <Link
                href="tel:+917490028867"
                title={t("common.callNumber", { number: "+91 7490028867" })}
                aria-label={t("common.callNumber", {
                  number: "+91 7490028867",
                })}
                className="hidden transition-colors duration-200 hover:text-amber-400 md:inline"
              >
                +91 7490028867
              </Link>
            </div>
          </div>

          {/* ================= HELP CENTER ================= */}

          <Link
            href="/contact"
            title={t("nav.helpCenter")}
            aria-label={t("nav.helpCenter")}
            className="flex items-center gap-2 text-sm leading-none text-white transition-colors duration-200 hover:text-amber-400"
          >
            <Headset className="h-4 w-4 shrink-0" />

            <span className="hidden sm:inline">{t("nav.helpCenter")}</span>
          </Link>
        </div>
      </div>

      {/* =====================================================
          MAIN HEADER
      ===================================================== */}

      <div className="border-b border-gray-100">
        <div className="container mx-auto px-3 lg:px-6 py-3">
          {/* =================================================
              MAIN HEADER ROW
          ================================================= */}

          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* ================= LOGO ================= */}

            <Link
              href="/"
              className="shrink-0"
              aria-label={t("common.storeHome")}
            >
              <Image
                src={Logo}
                alt={t("common.storeLogo")}
                className="h-auto w-20 sm:w-24"
                priority
              />
            </Link>

            {/* =================================================
                DESKTOP SEARCH
                Visible only lg+
            ================================================= */}

            <div className="relative hidden flex-1 lg:block max-w-3xl xl:max-w-4xl mx-2 sm:mx-6">
              <SearchBar
                redirectToallproducts
                size="md"
                placeholder={t("search.placeholder")}
              />
            </div>

            {/* =================================================
                RIGHT ACTIONS
            ================================================= */}

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
              {/* =================================================
                  LANGUAGE
                  Click/tap dropdown — works on desktop + mobile
              ================================================= */}

              <div
                ref={languageRef}
                className="notranslate relative"
                translate="no"
              >
                <button
                  type="button"
                  aria-label={t("language.select")}
                  aria-expanded={isLanguageOpen}
                  aria-haspopup="menu"
                  onClick={() => {
                    setIsLanguageOpen((open) => !open);
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 sm:gap-2 sm:px-2.5"
                >
                  {/* Language icon on mobile, text on sm+ */}

                  <Languages className="h-5 w-5 sm:hidden" />

                  <span className="hidden sm:inline">
                    {language === "gu"
                      ? t("language.gujaratiNative")
                      : t("language.englishNative")}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isLanguageOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Language Dropdown */}

                <div
                  className={`absolute left-1/2 top-full z-[120] mt-2 w-[calc(100vw-24px)] max-w-[240px] -translate-x-1/2 origin-top overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.12)] transition-all duration-200 sm:left-auto sm:right-0 sm:translate-x-0 sm:origin-top-right ${
                    isLanguageOpen
                      ? "visible translate-y-0 scale-100 opacity-100"
                      : "invisible translate-y-1 scale-95 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="border-b border-gray-100 px-4 py-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                      {t("language.select")}
                    </p>
                  </div>

                  <div className="p-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("en");
                        setIsLanguageOpen(false);
                      }}
                      className={`mt-1 flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 ${
                        language === "en"
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {t("language.english")}
                        </p>

                        <p className="text-[11px] text-gray-400">
                          {t("language.englishNative")}
                        </p>
                      </div>
                      {language === "en" && <Check className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("gu");
                        setIsLanguageOpen(false);
                      }}
                      className={`mt-1 flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 ${
                        language === "gu"
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {t("language.gujaratiNative")}
                        </p>

                        <p className="text-[11px] text-gray-400">
                          {t("language.gujarati")}
                        </p>
                      </div>
                      {language === "gu" && <Check className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* ================= DIVIDER ================= */}

              <span className="hidden h-7 w-px bg-gray-200 sm:block" />

              {/* =================================================
                  CART
              ================================================= */}

              <Link
                href="/cart"
                className="relative flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600"
                aria-label={
                  cartItemCount
                    ? t("common.openCartItems", { count: cartItemCount })
                    : t("common.openCart")
                }
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />

                {pathname !== "/cart" &&
                  hasUnreadCartChanges &&
                  cartItemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-bold text-white">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}

                <span className="hidden sm:inline">{t("nav.cart")}</span>
              </Link>

              {/* =================================================
                  HAMBURGER
                  Visible below lg
              ================================================= */}

              <button
                type="button"
                aria-label={t("common.openNavigation")}
                aria-expanded={isSidebarOpen}
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition-all duration-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-500 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE SEARCH
      ===================================================== */}

      <div className="border-b border-gray-100 py-3 lg:border-0 lg:py-0">
        <div className="container px-3 lg:px-6 mx-auto">
          <div className="relative lg:hidden">
            <SearchBar
              redirectToallproducts
              size="lg"
              placeholder={t("search.placeholder")}
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          DESKTOP NAVIGATION
          Visible only lg+
      ===================================================== */}

      <nav className="hidden border-b border-gray-100 bg-white lg:block">
        <div className="container px-3 lg:px-6 mx-auto flex items-center justify-between gap-6 overflow-visible">
          {/* ================= CATEGORIES ================= */}

          <div
            className="relative group"
            onMouseEnter={() => setIsCategoryMenuOpen(true)}
            onMouseLeave={() => setIsCategoryMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen((open) => !open)}
              aria-expanded={isCategoryMenuOpen}
              aria-haspopup="menu"
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                isCategoryMenuOpen
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
              }`}
            >
              {t("nav.categories")}
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isCategoryMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Categories Dropdown */}

            <div
              className={`absolute left-0 top-full z-50 mt-3 w-64 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl transition-all duration-200 ${
                isCategoryMenuOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible translate-y-2 opacity-0"
              }`}
            >
              {/* Dropdown Header */}

              <div className="mb-2 px-2 py-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {t("nav.browseCategories")}
                </p>
              </div>

              {/* Categories */}

              <div className="space-y-1">
                {navigationCategories.map((category) => {
                  const active = isActive(category.href);

                  return (
                    <Link
                      key={category.id}
                      href={category.href}
                      onClick={() => setIsCategoryMenuOpen(false)}
                      className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "border-orange-200 bg-orange-50 text-orange-600"
                          : "border-transparent text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                    >
                      <span
                        className={
                          category.usesStoredGujarati ? "notranslate" : ""
                        }
                        translate={
                          category.usesStoredGujarati ? "no" : undefined
                        }
                      >
                        {category.name}
                      </span>

                      <span className="text-base">→</span>
                    </Link>
                  );
                })}
                {navigationCategories.length === 0 && (
                  <p className="px-3 py-4 text-center text-sm text-gray-500">
                    {t("nav.noCategories")}
                  </p>
                )}
              </div>

              {/* Divider */}

              <div className="my-3 border-t border-gray-100" />

              {/* View All */}

              <Link
                href="/allproducts"
                onClick={() => setIsCategoryMenuOpen(false)}
                className="flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600"
              >
                {t("nav.viewAllBooks")}
              </Link>
            </div>
          </div>

          {/* ================= DESKTOP MENU ================= */}

          <div className="flex items-center py-2 lg:gap-5 xl:gap-6">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.sectionId)}
                  className={`py-2 text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "text-orange-500"
                      : "text-gray-700 hover:text-orange-500"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* =====================================================
          MOBILE / TABLET SIDEBAR OVERLAY
      ===================================================== */}

      <div
        aria-hidden={!isSidebarOpen}
        className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={closeSidebar}
      />

      {/* =====================================================
          RIGHT SIDEBAR
      ===================================================== */}

      <aside
        aria-label={t("common.mobileNavigation")}
        aria-hidden={!isSidebarOpen}
        inert={!isSidebarOpen}
        className={`fixed right-0 top-0 z-[110] flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ================= SIDEBAR HEADER ================= */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <Link href="/" onClick={closeSidebar} className="shrink-0">
            <Image
              src={Logo}
              alt={t("common.storeLogo")}
              className="h-auto w-20"
            />
          </Link>

          {/* Close Button */}

          <button
            type="button"
            aria-label={t("common.closeNavigation")}
            onClick={closeSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all duration-200 hover:bg-orange-500 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================= SIDEBAR CONTENT ================= */}

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* =================================================
              CATEGORIES
          ================================================= */}

          <div className="mb-3">
            {/* Categories Button */}

            <button
              type="button"
              onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
              aria-expanded={isMobileCategoriesOpen}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isMobileCategoriesOpen
                  ? "bg-orange-500 text-white"
                  : "bg-gray-50 text-gray-800 hover:bg-orange-50 hover:text-orange-500"
              }`}
            >
              <span>{t("nav.categories")}</span>

              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${
                  isMobileCategoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Category Items */}

            <div
              className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                isMobileCategoriesOpen
                  ? "mt-2 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="space-y-1 rounded-xl bg-gray-50 p-2">
                  {navigationCategories.map((category) => {
                    const active = isActive(category.href);

                    return (
                      <Link
                        key={category.id}
                        href={category.href}
                        onClick={closeSidebar}
                        className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          active
                            ? "bg-orange-50 text-orange-600"
                            : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      >
                        <span
                          className={
                            category.usesStoredGujarati ? "notranslate" : ""
                          }
                          translate={
                            category.usesStoredGujarati ? "no" : undefined
                          }
                        >
                          {category.name}
                        </span>

                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    );
                  })}
                  {navigationCategories.length === 0 && (
                    <p className="px-3 py-4 text-center text-sm text-gray-500">
                      {t("nav.noCategories")}
                    </p>
                  )}

                  {/* View All */}

                  <Link
                    href="/allproducts"
                    onClick={closeSidebar}
                    className="mt-2 flex items-center justify-center rounded-lg bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600"
                  >
                    {t("nav.viewAllBooks")}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              MOBILE NAVIGATION
          ================================================= */}

          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    handleSmoothScroll(e, item.sectionId);
                    closeSidebar();
                  }}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-orange-50 text-orange-500"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                  }`}
                >
                  <span>{item.name}</span>

                  <ChevronRight className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </header>
  );
}

export default Header;
