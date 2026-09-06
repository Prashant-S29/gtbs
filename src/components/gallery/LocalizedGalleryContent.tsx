"use client";

import { User } from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeGallery } from "@/lib/localizedGallery";
import type { GalleryItem } from "@/types/gallery";

type LocalizedGalleryField = "title" | "category" | "location" | "description";

export function LocalizedGalleryText({
  gallery,
  field,
}: {
  gallery: GalleryItem;
  field: LocalizedGalleryField;
}) {
  const { language } = useLanguage();
  const localizedGallery = localizeGallery(gallery, language);
  const usesStoredGujarati = language === "gu" && Boolean(gallery.gujarati);

  return (
    <span
      className={usesStoredGujarati ? "notranslate" : undefined}
      translate={usesStoredGujarati ? "no" : undefined}
    >
      {localizedGallery[field]}
    </span>
  );
}

export function LocalizedGalleryBreadcrumb({
  gallery,
}: {
  gallery: GalleryItem;
}) {
  const { language, t } = useLanguage();
  const localizedGallery = localizeGallery(gallery, language);
  const usesStoredGujarati = language === "gu" && Boolean(gallery.gujarati);

  return (
    <div
      className={usesStoredGujarati ? "notranslate" : undefined}
      translate={usesStoredGujarati ? "no" : undefined}
    >
      <Breadcrumb
        items={[
          { label: t("nav.home"), href: "/" },
          {
            label: t("nav.gallery"),
            href: "/gallery",
          },
          { label: localizedGallery.title },
        ]}
      />
    </div>
  );
}

export function LocalizedGalleryOrganizer({
  gallery,
}: {
  gallery: GalleryItem;
}) {
  const { language, t } = useLanguage();
  const localizedGallery = localizeGallery(gallery, language);
  const usesStoredGujarati = language === "gu" && Boolean(gallery.gujarati);

  if (!localizedGallery.organizer) return null;

  return (
    <p className="mt-3 flex items-center gap-1.5 text-sm description tracking-wide text-gray-500">
      <User size={16} className="text-orange-600" />
      <span
        className={usesStoredGujarati ? "notranslate" : undefined}
        translate={usesStoredGujarati ? "no" : undefined}
      >
        {t("gallery.organizedBy")}{" "}
        <strong className="ml-1 text-gray-800">
          {localizedGallery.organizer}
        </strong>
      </span>
    </p>
  );
}
