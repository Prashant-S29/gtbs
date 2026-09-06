import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { siteConfig } from "@/lib/seo";
import StorefrontText from "@/components/common/StorefrontText";

export const metadata: Metadata = {
  title: { absolute: `Page Not Found | ${siteConfig.name}` },
  description:
    "The page you requested could not be found at Gujarat Tract Book Store.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-16 text-center lg:px-6">
      <div>
        <SearchX className="mx-auto text-orange-600" size={42} />
        <p className="description mt-5 text-sm font-bold uppercase text-orange-600">
          <StorefrontText translationKey="errors.notFound.badge" />
        </p>
        <h1 className="title mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          <StorefrontText translationKey="errors.notFound.title" />
        </h1>
        <p className="description mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
          <StorefrontText translationKey="errors.notFound.description" />
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            <Home size={17} />
            <StorefrontText translationKey="errors.notFound.home" />
          </Link>
          <Link
            href="/allproducts"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 text-sm font-semibold text-gray-800 transition-colors hover:border-orange-300 hover:text-orange-600"
          >
            <ArrowLeft size={17} />
            <StorefrontText translationKey="errors.notFound.browse" />
          </Link>
        </div>
      </div>
    </main>
  );
}
