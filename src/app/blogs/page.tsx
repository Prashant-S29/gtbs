import BlogsPageClient from "@/components/blog/BlogsPageClient";
import { getBlogs } from "@/lib/contentRepository";

export const revalidate = 300;

export default async function BlogsPage() {
  return <BlogsPageClient initialItems={await getBlogs()} />;
}
