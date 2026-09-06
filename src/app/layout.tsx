import type { Metadata } from "next";

import "./globals.css";

import JsonLd from "@/components/seo/JsonLd";
import SiteChrome from "@/components/layout/SiteChrome";
import { getCategories } from "@/lib/contentRepository";
import { absoluteUrl, siteConfig, siteUrl } from "@/lib/seo";

const isPreviewDeployment = process.env.VERCEL_ENV === "preview";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GTBS Book Store | Christian Books, Bibles & Faith Resources",
    template: "%s | GTBS Book Store",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName, url: siteUrl }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  keywords: [...siteConfig.keywords],
  category: "shopping",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteUrl,
    siteName: siteConfig.name,
    title: "GTBS Book Store | Christian Books, Bibles & Faith Resources",
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.socialImage,
        alt: "Gujarat Tract Book Store Christian books and Bibles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GTBS Book Store | Christian Books, Bibles & Faith Resources",
    description: siteConfig.description,
    images: [siteConfig.socialImage],
  },
  robots: {
    index: !isPreviewDeployment,
    follow: !isPreviewDeployment,
    noarchive: isPreviewDeployment,
    nosnippet: isPreviewDeployment,
    noimageindex: isPreviewDeployment,
    googleBot: isPreviewDeployment
      ? {
          index: false,
          follow: false,
          noarchive: true,
          nosnippet: true,
          noimageindex: true,
        }
      : {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
  },
  icons: {
    icon: "/images/logo/logo.webp",
    apple: "/images/logo/logo.webp",
  },
  verification: isPreviewDeployment
    ? undefined
    : { google: process.env.GOOGLE_SITE_VERIFICATION },
};

const storeStructuredData = {
  "@context": "https://schema.org",
  "@type": ["BookStore", "Organization"],
  "@id": `${siteUrl}/#store`,
  name: siteConfig.legalName,
  alternateName: siteConfig.name,
  url: siteUrl,
  logo: absoluteUrl("/images/logo/logo.webp"),
  image: absoluteUrl(siteConfig.socialImage),
  description: siteConfig.description,
  email: siteConfig.email,
  telephone: siteConfig.phone,
  address: {
    "@type": "PostalAddress",
    ...siteConfig.address,
  },
  openingHours: "Mo-Sa 10:00-18:00",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans antialiased" suppressHydrationWarning>
        <JsonLd data={storeStructuredData} />
        <SiteChrome categories={categories}>{children}</SiteChrome>
      </body>
    </html>
  );
}
