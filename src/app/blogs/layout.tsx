import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Book Blog & Reading Guides",
  description:
    "Read book recommendations, author insights, reading guides, literary news, and faith-focused articles from GTBS Book Store.",
  path: "/blogs",
  image: "/images/blog/blog.webp",
});

export default function BlogsLayout({ children }: { children: ReactNode }) {
  return children;
}
