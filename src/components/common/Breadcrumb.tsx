"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BreadcrumbItem {
  label: string;
  href?: string;
  skipTranslation?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHomeIcon?: boolean;
  className?: string;
}

const Breadcrumb = ({
  items,
  showHomeIcon = true,
  className = "",
}: BreadcrumbProps) => {
  const { t } = useLanguage();

  return (
    <nav
      aria-label={t("common.breadcrumb")}
      className={`mb-8 flex flex-wrap items-center gap-2 text-sm font-medium description tracking-wide text-gray-500 ${className}`}
    >
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="flex items-center gap-1.5 transition-colors hover:text-orange-600"
              >
                {isFirst && showHomeIcon && (
                  <Home
                    size={15}
                    className="shrink-0 text-gray-400 group-hover:text-orange-600"
                  />
                )}
                <span
                  className={item.skipTranslation ? "notranslate" : undefined}
                  translate={item.skipTranslation ? "no" : undefined}
                >
                  {item.label}
                </span>
              </Link>
            ) : (
              <span
                className={`truncate max-w-[200px] sm:max-w-md font-semibold text-gray-700 ${item.skipTranslation ? "notranslate" : ""}`}
                translate={item.skipTranslation ? "no" : undefined}
              >
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight size={13} className="shrink-0 text-gray-400" />
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
