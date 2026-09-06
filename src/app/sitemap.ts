import type { MetadataRoute } from "next";
import { getBlogs, getGalleries, getProducts } from "@/lib/contentRepository";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, galleries, products] = await Promise.all([
    getBlogs(),
    getGalleries(),
    getProducts(),
  ]);
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl("/allproducts"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/blogs"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/gallery"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.6 },
    {
      url: absoluteUrl("/privacy-policy"),
      lastModified: new Date("2026-09-05"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms-and-conditions"),
      lastModified: new Date("2026-09-05"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/shipping-and-delivery-policy"),
      lastModified: new Date("2026-09-05"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${product.id}`),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: absoluteUrl(`/blogs/${blog.slug}`),
    lastModified: new Date(blog.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const galleryPages: MetadataRoute.Sitemap = galleries.map((gallery) => ({
    url: absoluteUrl(`/gallery/${gallery.slug}`),
    lastModified: new Date(gallery.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...blogPages, ...galleryPages];
}
