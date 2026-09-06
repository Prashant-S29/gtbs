import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Products",
  description:
    "Discover books, gifts, accessories, and other products available from GTBS Book Store.",
  path: "/allproducts",
});

export default function ProductLayout({ children }: { children: ReactNode }) {
  return children;
}
