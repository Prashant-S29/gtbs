"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";
import OurStoryImage from "../../../public/images/about/story.webp";
import { useLanguage } from "@/contexts/LanguageContext";

const OurStory = () => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-white py-10">
      <div className="container relative px-3 lg:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          {/* ================= LEFT CONTENT ================= */}
          <div>
            {/* Label */}
            <div className="mb-5 flex items-center gap-3">
              <span className="text-xs description font-bold uppercase tracking-[0.18em] text-orange-600">
                {t("about.story.badge")}
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-2xl text-3xl title font-bold leading-[1.12] tracking-tight text-gray-900 sm:text-4xl md:text-[46px]">
              {t("about.story.titleLine1")}
              <br />
              <span className="text-orange-600">
                {t("about.story.titleLine2")}
              </span>
            </h1>

            {/* Description */}
            <div className="mt-6 space-y-4">
              <p className="text-sm leading-7 text-gray-600 md:text-[16px] description">
                {t("about.story.paragraph1")}
              </p>

              <p className="text-sm leading-7 text-gray-600 md:text-[16px] description">
                {t("about.story.paragraph2")}
              </p>
            </div>

            {/* Stats */}
            <div className="mt-8 grid max-w-xl grid-cols-3 divide-x divide-gray-200 border-y border-gray-200 py-5">
              <div className="pr-4">
                <p className="text-xl font-bold text-gray-900 md:text-2xl">
                  1K+
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  {t("about.story.booksAvailable")}
                </p>
              </div>

              <div className="px-4">
                <p className="text-xl font-bold text-gray-900 md:text-2xl">
                  8K+
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  {t("about.story.happyReaders")}
                </p>
              </div>

              <div className="pl-4">
                <p className="text-xl font-bold text-gray-900 md:text-2xl">
                  4.9/5
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  {t("about.story.readerRating")}
                </p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT IMAGE ================= */}
          <div className="relative lg:pl-4">
            {/* Image */}
            <div className="relative overflow-hidden rounded-[28px] bg-gray-100 shadow-xl">
              <div className="aspect-[1.3/1] w-full">
                <Image
                  src={OurStoryImage}
                  alt={t("about.story.imageAlt")}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>

              {/* Bottom overlay */}
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/90 p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                      {t("about.story.since")}
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {t("about.story.overlay")}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white">
                    <BookOpen size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
