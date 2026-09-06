import type { GalleryItem } from "@/types/gallery";

export function localizeGallery(
  gallery: GalleryItem,
  language: "en" | "gu",
): GalleryItem {
  if (language !== "gu" || !gallery.gujarati) return gallery;

  return {
    ...gallery,
    title: gallery.gujarati.title,
    category: gallery.gujarati.category,
    location: gallery.gujarati.location,
    description: gallery.gujarati.description,
    organizer: gallery.gujarati.organizer,
  };
}
