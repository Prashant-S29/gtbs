"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { GalleryPhoto } from "@/types/gallery";
import { useLanguage } from "@/contexts/LanguageContext";

interface GalleryLightboxProps {
  photos: GalleryPhoto[];
}

const PHOTO_BATCH_SIZE = 8;

export default function GalleryLightbox({ photos }: GalleryLightboxProps) {
  const { t } = useLanguage();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [visibleCount, setVisibleCount] = useState(PHOTO_BATCH_SIZE);
  const visiblePhotos = photos.slice(0, visibleCount);
  const hasMorePhotos = visibleCount < photos.length;
  const isLightboxOpen = selectedPhotoIndex !== null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedPhotoIndex(null);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setSelectedPhotoIndex((current) =>
          current === null ? null : (current + 1) % visiblePhotos.length,
        );
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSelectedPhotoIndex((current) =>
          current === null
            ? null
            : (current - 1 + visiblePhotos.length) % visiblePhotos.length,
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isLightboxOpen, visiblePhotos.length]);

  const openLightbox = (index: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % visiblePhotos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(
        (selectedPhotoIndex - 1 + visiblePhotos.length) % visiblePhotos.length,
      );
    }
  };

  return (
    <>
      {/* Photo Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {visiblePhotos.map((photo, idx) => (
          <div
            key={photo.id}
            role="button"
            tabIndex={0}
            aria-label={t("gallery.lightbox.open", { title: photo.title })}
            onClick={(event) => openLightbox(idx, event.currentTarget)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(idx, event.currentTarget);
              }
            }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-100 border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>

            {/* Hover Caption Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 text-white translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <h4 className="title text-md font-bold text-white leading-tight drop-shadow-sm">
                {photo.title}
              </h4>
              {photo.caption && (
                <p className="description text-sm text-gray-200 line-clamp-1 mt-0.5">
                  {photo.caption}
                </p>
              )}
            </div>

            {/* Expand Icon Badge */}
            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 size={14} />
            </div>
          </div>
        ))}
      </div>

      {hasMorePhotos && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((current) =>
                Math.min(current + PHOTO_BATCH_SIZE, photos.length),
              )
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-6 text-sm font-semibold text-orange-700 transition-colors hover:border-orange-300 hover:bg-orange-100"
          >
            {t("gallery.lightbox.viewMore")}
            <ChevronDown size={17} />
          </button>
          <span className="text-xs text-gray-500">
            {t("gallery.lightbox.showing", {
              visible: visiblePhotos.length,
              total: photos.length,
            })}
          </span>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          {/* Close button */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeLightbox}
            aria-label={t("gallery.lightbox.close")}
            className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Left Arrow */}
          <button
            type="button"
            onClick={prevPhoto}
            aria-label={t("gallery.lightbox.previous")}
            className="absolute left-5 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={nextPhoto}
            aria-label={t("gallery.lightbox.next")}
            className="absolute right-5 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          {/* Modal Image Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] max-w-[90vw] flex flex-col items-center"
          >
            <div className="relative h-[65vh] w-[80vw] max-w-4xl">
              <Image
                src={visiblePhotos[selectedPhotoIndex].url}
                alt={visiblePhotos[selectedPhotoIndex].title}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <div className="mt-4 text-center text-white">
              <h3 id="lightbox-title" className="title text-lg font-semibold">
                {visiblePhotos[selectedPhotoIndex].title}
              </h3>
              {visiblePhotos[selectedPhotoIndex].caption && (
                <p className="description text-sm tracking-wide text-gray-300 mt-1 max-w-xl">
                  {visiblePhotos[selectedPhotoIndex].caption}
                </p>
              )}
              <span className="text-[14px] text-orange-400 mt-2 block">
                {selectedPhotoIndex + 1} / {visiblePhotos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
