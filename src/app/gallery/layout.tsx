import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Bookstore Events & Gallery",
  description:
    "Explore photos from Gujarat Tract Book Store events, exhibitions, community programs, author gatherings, and book launches.",
  path: "/gallery",
});

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return children;
}
