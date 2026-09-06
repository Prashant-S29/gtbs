import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Camera, ArrowRight } from "lucide-react";
import { getGalleries, getGallery } from "@/lib/contentRepository";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import {
  LocalizedGalleryBreadcrumb,
  LocalizedGalleryOrganizer,
  LocalizedGalleryText,
} from "@/components/gallery/LocalizedGalleryContent";
import JsonLd from "@/components/seo/JsonLd";
import StorefrontText from "@/components/common/StorefrontText";
import {
  absoluteUrl,
  createPageMetadata,
  siteConfig,
  siteUrl,
  truncateDescription,
} from "@/lib/seo";

interface GalleryDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: GalleryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const album = await getGallery(id);

  if (!album) {
    return {
      title: "Gallery Album Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    ...createPageMetadata({
      title: album.title,
      description: truncateDescription(album.description),
      path: `/gallery/${album.slug}`,
      image: album.coverImage,
    }),
    keywords: [album.category, "GTBS events"],
  };
}

export default async function GalleryDetailPage({
  params,
}: GalleryDetailPageProps) {
  const { id } = await params;
  const album = await getGallery(id);

  if (!album) {
    notFound();
  }

  if (id !== album.slug) {
    redirect(`/gallery/${album.slug}`);
  }

  const otherAlbums = (await getGalleries())
    .filter((item) => String(item.id) !== String(album.id))
    .slice(0, 2);

  const galleryStructuredData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${absoluteUrl(`/gallery/${album.slug}`)}#gallery`,
    name: album.title,
    description: album.description,
    url: absoluteUrl(`/gallery/${album.slug}`),
    image: absoluteUrl(album.coverImage),
    creator: {
      "@type": "Organization",
      "@id": `${siteUrl}/#store`,
      name: siteConfig.legalName,
    },
    associatedMedia: album.photos.map((photo) => ({
      "@type": "ImageObject",
      name: photo.title,
      caption: photo.caption,
      contentUrl: absoluteUrl(photo.url),
    })),
  };

  return (
    <>
      <JsonLd data={galleryStructuredData} />
      <div className="container mx-auto px-4 py-8 md:py-10">
        {/* Breadcrumbs */}
        <LocalizedGalleryBreadcrumb gallery={album} />

        <div className="md:p-6 p-3 rounded-xl bg-white shadow-sm border border-gray-400">
          {/* Hero Title & Event Details Header */}
          <header className="mb-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
              <span className="rounded-full bg-orange-100 px-3.5 py-1 text-xs description tracking-wide font-semibold text-orange-700">
                <LocalizedGalleryText gallery={album} field="category" />
              </span>
              <div className="flex items-center gap-1">
                <CalendarDays size={16} className="text-orange-600" />
                <p className="text-sm text-gray-500 description tracking-wide">
                  {album.date}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-orange-600" />
                <p className="text-sm text-gray-500 description tracking-wide">
                  <LocalizedGalleryText gallery={album} field="location" />
                </p>
              </div>
            </div>

            <h1 className="title text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
              <LocalizedGalleryText gallery={album} field="title" />
            </h1>

            <LocalizedGalleryOrganizer gallery={album} />
          </header>

          {/* Story & Background Info Box */}
          <div className="mb-12 rounded-3xl bg-gradient-to-br from-orange-50/60 via-amber-50/40 to-white p-3 sm:p-6 border border-orange-100">
            <h2 className="title text-lg font-bold text-gray-900 mb-2">
              <StorefrontText translationKey="gallery.detail.about" />
            </h2>
            <p className="description text-sm md:text-base leading-relaxed text-gray-700">
              <LocalizedGalleryText gallery={album} field="description" />
            </p>
          </div>

          {/* Photos Section Header */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Camera size={20} className="text-orange-600" />
              <h2 className="title text-2xl font-bold text-gray-900">
                <StorefrontText
                  translationKey="gallery.detail.photoCollection"
                  params={{ count: album.photos.length }}
                />
              </h2>
            </div>
            <span className="text-sm text-gray-500 sm:text-right">
              <StorefrontText translationKey="gallery.detail.photoHint" />
            </span>
          </div>

          {/* Interactive Lightbox Photos Grid */}
          <GalleryLightbox photos={album.photos} />
        </div>

        {/* Other Galleries Section */}
        {otherAlbums.length > 0 && (
          <section className="mt-15 border-t border-gray-100 pt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="title text-2xl font-bold text-gray-900">
                <StorefrontText translationKey="gallery.detail.explore" />
              </h2>
              <Link
                href="/gallery"
                className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline"
              >
                <StorefrontText translationKey="action.viewAll" />{" "}
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherAlbums.map((other) => (
                <Link
                  key={other.id}
                  href={`/gallery/${other.slug}`}
                  className="group flex flex-col sm:flex-row gap-5 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[4/3] w-full sm:w-48 overflow-hidden rounded-xl bg-gray-100 shrink-0">
                    <Image
                      src={other.coverImage}
                      alt={other.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 192px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[13px] description tracking-wide font-semibold text-white">
                      <StorefrontText
                        translationKey="gallery.detail.photosLower"
                        params={{ count: other.photos.length }}
                      />
                    </span>
                  </div>

                  <div className="flex flex-col justify-center">
                    <span className="text-sm description tracking-wide font-semibold text-orange-600">
                      <LocalizedGalleryText gallery={other} field="category" />
                    </span>
                    <h4 className="title text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors mt-1">
                      <LocalizedGalleryText gallery={other} field="title" />
                    </h4>
                    <p className="text-sm description tracking-wide text-gray-500 mt-1">
                      {other.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
