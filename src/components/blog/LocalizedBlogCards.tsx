"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { localizeBlog } from "@/lib/localizedBlog";
import type { BlogPost } from "@/types/blog";

export default function LocalizedBlogCards({ blogs }: { blogs: BlogPost[] }) {
  const { language, t } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {blogs.map((sourceBlog) => {
        const blog = localizeBlog(sourceBlog, language);
        const localizedAttributes =
          language === "gu" && sourceBlog.gujarati
            ? { className: "notranslate", translate: "no" as const }
            : {};

        return (
          <article
            key={blog.id}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-100 hover:shadow-[0_12px_35px_rgba(249,115,22,0.10)]"
          >
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span
                className={`${localizedAttributes.className ?? ""} absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-orange-600 shadow-sm backdrop-blur-sm`}
                translate={localizedAttributes.translate}
              >
                {blog.category}
              </span>
            </Link>

            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                <CalendarDays size={13} />
                <span>{blog.date}</span>
              </div>
              <Link href={`/blogs/${blog.slug}`}>
                <h3
                  className={`${localizedAttributes.className ?? ""} line-clamp-2 text-[15px] font-semibold leading-6 text-gray-900 transition-colors duration-300 group-hover:text-orange-600`}
                  translate={localizedAttributes.translate}
                >
                  {blog.title}
                </h3>
              </Link>
              <Link
                href={`/blogs/${blog.slug}`}
                className="group/link mt-auto flex w-fit items-center gap-1.5 pt-4 text-xs font-semibold text-gray-800 transition-colors duration-300 hover:text-orange-600"
              >
                {t("action.readMore")}
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover/link:translate-x-1"
                />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
