import GalleryPageClient from "@/components/gallery/GalleryPageClient";
import { getGalleries } from "@/lib/contentRepository";

export const revalidate = 300;

export default async function GalleryPage() {
  return <GalleryPageClient initialItems={await getGalleries()} />;
}
