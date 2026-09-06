import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { getBlog, getBlogs } from "@/lib/contentRepository";
import {
  LocalizedBlogArticle,
  LocalizedBlogBreadcrumb,
  LocalizedBlogText,
} from "@/components/blog/LocalizedBlogContent";
import JsonLd from "@/components/seo/JsonLd";
import StorefrontText from "@/components/common/StorefrontText";
import {
  absoluteUrl,
  createPageMetadata,
  siteConfig,
  siteUrl,
  truncateDescription,
} from "@/lib/seo";

interface BlogPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { id } = await params;
  const blog = await getBlog(id);

  if (!blog) {
    return {
      title: "Article Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description = truncateDescription(blog.summary);
  const baseMetadata = createPageMetadata({
    title: blog.title,
    description,
    path: `/blogs/${blog.slug}`,
    image: blog.image,
  });

  return {
    ...baseMetadata,
    authors: [{ name: blog.author.name }],
    keywords: blog.tags,
    openGraph: {
      ...baseMetadata.openGraph,
      type: "article",
      publishedTime: new Date(blog.date).toISOString(),
      authors: [blog.author.name],
      tags: blog.tags ?? [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { id } = await params;
  const blog = await getBlog(id);

  if (!blog) {
    notFound();
  }

  if (id !== blog.slug) {
    redirect(`/blogs/${blog.slug}`);
  }

  const relatedBlogs = (await getBlogs())
    .filter((item) => String(item.id) !== String(blog.id))
    .slice(0, 3);

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(`/blogs/${blog.slug}`)}#article`,
    headline: blog.title,
    description: blog.summary,
    image: absoluteUrl(blog.image),
    datePublished: new Date(blog.date).toISOString(),
    author: {
      "@type": "Person",
      name: blog.author.name,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#store`,
      name: siteConfig.legalName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/logo/logo.webp"),
      },
    },
    mainEntityOfPage: absoluteUrl(`/blogs/${blog.slug}`),
    keywords: (blog.tags ?? []).join(", "),
  };

  return (
    <>
      <JsonLd data={articleStructuredData} />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Breadcrumbs */}
        <LocalizedBlogBreadcrumb blog={blog} />

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-sm description tracking-wide mb-3">
            <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700">
              <LocalizedBlogText blog={blog} field="category" />
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <CalendarDays size={18} />
              {blog.date}
            </span>
          </div>

          <h1 className="title text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl lg:text-5xl leading-tight">
            <LocalizedBlogText blog={blog} field="title" />
          </h1>

          {/* Author info pill */}
          <div className="mt-6 flex items-center gap-3.5 border-y border-gray-100 py-4">
            <Image
              src={blog.author.avatar}
              alt={blog.author.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-orange-200"
            />
            <div>
              <p className="text-lg font-semibold description tracking-wide text-orange-600">
                <LocalizedBlogText blog={blog} field="authorName" />
              </p>
              <p className="text-sm description tracking-wide text-gray-600">
                <LocalizedBlogText blog={blog} field="authorRole" />
              </p>
            </div>
          </div>
        </header>

        {/* Featured Banner Image */}
        <div className="relative aspect-[20/9] w-full overflow-hidden rounded-3xl bg-gray-100 shadow-md mb-10">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1152px"
            className="object-cover"
          />
        </div>

        {/* Formatted Article Content */}
        <LocalizedBlogArticle blog={blog} />

        {/* Note / Buy Books Callout Card */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50/40 to-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm description tracking-wide">
                <Sparkles size={16} />
                <span>
                  <StorefrontText translationKey="blog.detail.recommended" />
                </span>
              </div>
              <h3 className="title text-xl sm:text-2xl font-bold text-gray-900">
                <StorefrontText translationKey="blog.detail.moreTitle" />
              </h3>
              <p className="description text-sm leading-relaxed text-gray-600">
                <StorefrontText translationKey="blog.detail.moreDescription" />
              </p>
            </div>

            <Link
              href="/allproducts"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition-all duration-200 hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/30 active:scale-[0.98] description tracking-wide"
            >
              <ShoppingBag size={18} />
              <span>
                <StorefrontText translationKey="blog.detail.browse" />
              </span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Related Reads */}
        {relatedBlogs.length > 0 && (
          <section className="mt-10 border-t border-gray-100 pt-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="title text-2xl font-bold text-gray-900">
                <StorefrontText translationKey="blog.detail.related" />
              </h2>
              <Link
                href="/blogs"
                className="text-sm font-bold description tracking-wide text-orange-600 hover:underline flex items-center gap-1"
              >
                <StorefrontText translationKey="action.viewAll" />{" "}
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {relatedBlogs.map((item) => (
                <Link
                  key={item.id}
                  href={`/blogs/${item.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-100 mb-3">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className="text-sm description tracking-wide font-semibold text-orange-600 mb-1">
                    <LocalizedBlogText blog={item} field="category" />
                  </span>
                  <h4 className="line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors title">
                    <LocalizedBlogText blog={item} field="title" />
                  </h4>
                  <span className="text-sm description tracking-wide text-gray-400 mt-2">
                    {item.date}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
