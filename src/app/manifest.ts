import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gujarat Tract Book Store",
    short_name: "GTBS Book Store",
    description:
      "Christian books, Holy Bibles, devotionals, study guides, and faith-inspired gifts.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ea580c",
    icons: [
      {
        src: "/images/logo/logo.webp",
        sizes: "any",
        type: "image/webp",
      },
    ],
  };
}
