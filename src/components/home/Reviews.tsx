"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeTestimonial } from "@/lib/localizedTestimonial";
import type { Testimonial } from "@/types/testimonial";

export default function Reviews({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const { language, t } = useLanguage();

  if (testimonials.length === 0) return null;

  const scroll = (direction: -1 | 1) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({
      left: direction * list.clientWidth * 0.9,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white py-14 md:py-16">
      <div className="container px-3 lg:px-6">
        <div className="mb-9 text-center">
          <p className="description mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            {t("home.reviews.badge")}
          </p>
          <h2 className="title text-3xl font-semibold text-gray-900 sm:text-4xl">
            {t("home.reviews.title")}
          </h2>
          <p className="description mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-[15px]">
            {t("home.reviews.description")}
          </p>
        </div>

        <div className="relative">
          <ul
            ref={listRef}
            aria-label={t("home.reviews.label")}
            className="grid snap-x snap-mandatory grid-flow-col auto-cols-[90%] gap-5 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-[48%] lg:auto-cols-[32%] lg:gap-6"
          >
            {testimonials.map((sourceTestimonial) => {
              const testimonial = localizeTestimonial(
                sourceTestimonial,
                language,
              );
              const usesStoredGujarati =
                language === "gu" && Boolean(sourceTestimonial.gujarati);

              return (
                <li key={testimonial.id} className="min-w-0 snap-start">
                  <article
                    className={`group flex h-full min-h-[235px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-colors hover:border-orange-200 ${usesStoredGujarati ? "notranslate" : ""}`}
                    translate={usesStoredGujarati ? "no" : undefined}
                    lang={usesStoredGujarati ? "gu" : undefined}
                  >
                    <div
                      className="flex items-center gap-1"
                      role="img"
                      aria-label={t("home.reviews.rating", {
                        rating: testimonial.rating,
                      })}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={17}
                          strokeWidth={star <= testimonial.rating ? 0 : 1.5}
                          className={
                            star <= testimonial.rating
                              ? "fill-orange-500 text-orange-500"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <blockquote className="description mt-5 text-sm leading-6 text-gray-600">
                      “{testimonial.review}”
                    </blockquote>
                    <footer className="mt-auto flex items-center gap-3 border-t border-gray-100 pt-5">
                      <div
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-semibold text-orange-600"
                      >
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="title text-[15px] font-semibold text-gray-900">
                          {testimonial.name}
                        </h3>
                        <p className="description mt-0.5 text-xs text-gray-400">
                          {testimonial.role}
                        </p>
                      </div>
                      <Quote
                        aria-hidden="true"
                        size={27}
                        strokeWidth={1.5}
                        className="ml-auto text-orange-100"
                      />
                    </footer>
                  </article>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={t("home.reviews.previous")}
            className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md hover:border-orange-600 hover:bg-orange-600 hover:text-white lg:flex"
          >
            <ChevronLeft size={19} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={t("home.reviews.next")}
            className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md hover:border-orange-600 hover:bg-orange-600 hover:text-white lg:flex"
          >
            <ChevronRight size={19} />
          </button>
        </div>
        <div className="mt-6 flex justify-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={t("home.reviews.previous")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:border-orange-600 hover:bg-orange-600 hover:text-white"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={t("home.reviews.next")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:border-orange-600 hover:bg-orange-600 hover:text-white"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
