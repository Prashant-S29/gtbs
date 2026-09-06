"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductImagesProps {
  images?: string[];
  mainImage: string;
  title: string;
  badge?: string;
}

export default function ProductImages({
  images,
  mainImage,
  title,
  badge,
}: ProductImagesProps) {
  const { t } = useLanguage();
  const allImages = [...new Set([mainImage, ...(images || [])])];
  const [selectedImage, setSelectedImage] = useState(allImages[0]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50 to-gray-100 p-6 shadow-sm">
        {badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-orange-600 px-3.5 py-1 text-xs font-semibold text-white shadow-md">
            {badge}
          </span>
        )}

        <div className="relative h-full w-full">
          <Image
            src={selectedImage}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* Horizontal Thumbnails */}
      {allImages.length > 1 && (
        <div
          className="flex max-w-full gap-3 overflow-x-auto pb-2"
          aria-label={t("product.images.thumbnails", { title })}
        >
          {allImages.map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => setSelectedImage(img)}
              aria-label={t("product.images.show", {
                title,
                index: idx + 1,
              })}
              aria-pressed={selectedImage === img}
              className={`relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                selectedImage === img
                  ? "border-orange-600 shadow-sm ring-2 ring-orange-100"
                  : "border-gray-200 opacity-75 hover:border-gray-300 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
