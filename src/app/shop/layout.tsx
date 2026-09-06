import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Shop Christian Books & Bibles",
  description:
    "Browse Christian books, Holy Bibles, devotionals, study guides, children's books, magazines, and faith-inspired gifts at GTBS Book Store.",
  path: "/shop",
});

export default function ShopLayout({ children }: { children: ReactNode }) {
  return children;
}
