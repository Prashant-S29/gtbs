import type { Metadata } from "next";

const configuredUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const siteUrl = configuredUrl.replace(/\/$/, "");

export const siteConfig = {
  name: "GTBS Book Store",
  legalName: "Gujarat Tract Book Store",
  description:
    "Shop Christian books, Holy Bibles, devotionals, study guides, children's books, magazines, and faith-inspired gifts from Gujarat Tract Book Store.",
  url: siteUrl,
  locale: "en_IN",
  email: "support@gtbsbooks.com",
  phone: "+91 92654 29338",
  whatsapp: "+91 74900 28867",
  address: {
    streetAddress:
      "Sahitya Seva Sadan, Shahid Veer Kinariwala Marg, I P Mission Compound, Ellisbridge",
    addressLocality: "Ahmedabad",
    addressRegion: "Gujarat",
    postalCode: "380006",
    addressCountry: "IN",
  },
  socialImage: "/images/banners/Home_banner.webp",
  keywords: [
    "Christian books",
    "Holy Bible",
    "Christian bookstore India",
    "Gujarati Christian books",
    "devotional books",
    "Bible study guides",
    "faith-inspired gifts",
    "GTBS Book Store",
    "Gujarat Tract Book Store",
  ],
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}

export function truncateDescription(value: string, maxLength = 160) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

export function createPageMetadata({
  title,
  description,
  path,
  image = siteConfig.socialImage,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const brandedTitle = title.includes(siteConfig.name)
    ? title
    : `${title} | ${siteConfig.name}`;

  return {
    title: { absolute: brandedTitle },
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: path,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            nocache: true,
          },
        }
      : {}),
  };
}
