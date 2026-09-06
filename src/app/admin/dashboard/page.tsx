import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  Images,
  MessageSquareQuote,
  Package,
  Plus,
  Tags,
  UsersRound,
} from "lucide-react";

import AdminContentShell from "@/components/admin/AdminContentShell";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import {
  getBlogs,
  getCategories,
  getGalleries,
  getProducts,
  getTeamMembers,
  getTestimonials,
} from "@/lib/contentRepository";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: `Admin Overview | ${siteConfig.name}` },
};
export const dynamic = "force-dynamic";

function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default async function AdminDashboardPage() {
  const session = await getCurrentAdminSession();
  if (!session) redirect("/admin/login");

  const [products, categories, blogs, galleries, testimonials, teamMembers] =
    await Promise.all([
      getProducts(),
      getCategories(),
      getBlogs(),
      getGalleries(),
      getTestimonials(),
      getTeamMembers(),
    ]);

  const categoryNames = new Map(
    categories.map((category) => [category.slug, category.name]),
  );
  const categoryProductCounts = categories
    .map((category) => ({
      ...category,
      productCount: products.filter(
        (product) => product.category === category.slug,
      ).length,
    }))
    .sort(
      (left, right) =>
        right.productCount - left.productCount ||
        left.name.localeCompare(right.name),
    );
  const populatedCategoryCount = categoryProductCounts.filter(
    (category) => category.productCount > 0,
  ).length;
  const knownCategorySlugs = new Set(
    categories.map((category) => category.slug),
  );
  const uncategorizedProductCount = products.filter(
    (product) => !knownCategorySlugs.has(product.category),
  ).length;
  const galleryPhotoCount = galleries.reduce(
    (total, gallery) => total + gallery.photos.length,
    0,
  );
  const averageRating = testimonials.length
    ? testimonials.reduce(
        (total, testimonial) => total + testimonial.rating,
        0,
      ) / testimonials.length
    : 0;
  const teamRoleCount = new Set(
    teamMembers.map((member) => member.role.trim()).filter(Boolean),
  ).size;
  const totalManagedRecords =
    products.length +
    categories.length +
    blogs.length +
    galleries.length +
    testimonials.length +
    teamMembers.length;

  const overviewCards = [
    {
      label: "Products",
      value: products.length,
      detail: `${countLabel(populatedCategoryCount, "category", "categories")} in use`,
      href: "/admin/products",
      action: "Manage products",
      icon: Package,
      tone: "bg-orange-50 text-orange-600",
    },
    {
      label: "Categories",
      value: categories.length,
      detail: `${countLabel(products.length, "product")} assigned`,
      href: "/admin/categories",
      action: "Manage categories",
      icon: Tags,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      label: "Blogs",
      value: blogs.length,
      detail: blogs[0]
        ? `Top entry: ${blogs[0].title}`
        : "No articles added yet",
      href: "/admin/blogs",
      action: "Manage blogs",
      icon: BookOpenText,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "Gallery",
      value: galleries.length,
      detail: `${countLabel(galleryPhotoCount, "photo")} across all albums`,
      href: "/admin/galleries",
      action: "Manage gallery",
      icon: Images,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Testimonials",
      value: testimonials.length,
      detail: testimonials.length
        ? `${averageRating.toFixed(1)} / 5 average rating`
        : "No testimonials added yet",
      href: "/admin/testimonials",
      action: "Manage testimonials",
      icon: MessageSquareQuote,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Team",
      value: teamMembers.length,
      detail: countLabel(teamRoleCount, "unique role"),
      href: "/admin/team",
      action: "Manage team",
      icon: UsersRound,
      tone: "bg-rose-50 text-rose-600",
    },
  ];

  const leadingCategory = categoryProductCounts[0];
  const contentSnapshots = [
    {
      label: "Product",
      title: products[0]?.title ?? "No products yet",
      detail: products[0]
        ? `${categoryNames.get(products[0].category) ?? products[0].category} · ₹${products[0].price.toFixed(2)}`
        : "Add the first storefront product",
      href: "/admin/products",
      icon: Package,
      tone: "bg-orange-50 text-orange-600",
    },
    {
      label: "Category",
      title: leadingCategory?.name ?? "No categories yet",
      detail: leadingCategory
        ? countLabel(leadingCategory.productCount, "product")
        : "Create a category for products",
      href: "/admin/categories",
      icon: Tags,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      label: "Blog",
      title: blogs[0]?.title ?? "No blog articles yet",
      detail: blogs[0]
        ? `${blogs[0].category} · ${blogs[0].date}`
        : "Publish the first article",
      href: "/admin/blogs",
      icon: BookOpenText,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "Gallery",
      title: galleries[0]?.title ?? "No gallery albums yet",
      detail: galleries[0]
        ? `${countLabel(galleries[0].photos.length, "photo")} · ${galleries[0].location}`
        : "Create the first gallery album",
      href: "/admin/galleries",
      icon: Images,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Testimonial",
      title: testimonials[0]?.name ?? "No testimonials yet",
      detail: testimonials[0]
        ? `${testimonials[0].role} · ${testimonials[0].rating} / 5 rating`
        : "Add the first customer testimonial",
      href: "/admin/testimonials",
      icon: MessageSquareQuote,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Team member",
      title: teamMembers[0]?.name ?? "No team members yet",
      detail: teamMembers[0]?.role ?? "Add the first team member",
      href: "/admin/team",
      icon: UsersRound,
      tone: "bg-rose-50 text-rose-600",
    },
  ];

  const maxCategoryProductCount = Math.max(
    1,
    ...categoryProductCounts.map((category) => category.productCount),
  );

  return (
    <AdminContentShell>
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-sm font-semibold text-orange-600">
              Live content summary
            </p>
            <h1 className="title text-2xl font-bold tracking-tight sm:text-3xl">
              Overview
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Repository-backed details for every managed storefront section.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[420px]:flex-row">
            <Link
              href="/admin/blogs/add"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Plus size={17} /> Add blog
            </Link>
            <Link
              href="/admin/products/add"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#172019] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#243327]"
            >
              <Plus size={17} /> Add product
            </Link>
          </div>
        </header>

        <section
          aria-label="Content totals"
          className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {overviewCards.map(
            ({ label, value, detail, href, action, icon: Icon, tone }) => (
              <article
                key={label}
                className="flex min-h-44 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                      {value}
                    </p>
                  </div>
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
                    aria-hidden="true"
                  >
                    <Icon size={20} />
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                  {detail}
                </p>
                <Link
                  href={href}
                  className="mt-auto inline-flex w-fit items-center gap-1 pt-4 text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  {action} <ArrowRight size={14} />
                </Link>
              </article>
            ),
          )}
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Products by category
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Live catalog distribution across managed categories.
                </p>
              </div>
              <Link
                href="/admin/categories"
                className="shrink-0 text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                View all
              </Link>
            </div>

            {categoryProductCounts.length ? (
              <div className="mt-6 space-y-5">
                {categoryProductCounts.slice(0, 8).map((category) => (
                  <div key={category.id}>
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                      <span className="truncate font-medium text-slate-700">
                        {category.name}
                      </span>
                      <strong className="shrink-0 text-slate-900">
                        {category.productCount}
                      </strong>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-label={`${category.name}: ${countLabel(category.productCount, "product")}`}
                      aria-valuemin={0}
                      aria-valuemax={maxCategoryProductCount}
                      aria-valuenow={category.productCount}
                    >
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{
                          width: `${(category.productCount / maxCategoryProductCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {categoryProductCounts.length > 8 ? (
                  <p className="text-xs text-slate-500">
                    {countLabel(
                      categoryProductCounts.length - 8,
                      "more category",
                      "more categories",
                    )}{" "}
                    available in Category management.
                  </p>
                ) : null}
                {uncategorizedProductCount ? (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    {countLabel(uncategorizedProductCount, "product")} reference
                    an unavailable category.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                <Tags className="mx-auto text-slate-400" size={24} />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No categories yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Add a category before organizing products.
                </p>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Content snapshot
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    A quick view of each managed section.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {countLabel(totalManagedRecords, "record")}
                </span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {contentSnapshots.map(
                ({ label, title, detail, href, icon: Icon, tone }) => (
                  <Link
                    key={label}
                    href={href}
                    className="group flex min-w-0 items-center gap-3 px-5 py-4 hover:bg-slate-50 sm:px-6"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
                      aria-hidden="true"
                    >
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {label}
                      </span>
                      <strong className="mt-0.5 block truncate text-sm text-slate-800">
                        {title}
                      </strong>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {detail}
                      </span>
                    </span>
                    <ArrowRight
                      className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600"
                      size={16}
                    />
                  </Link>
                ),
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminContentShell>
  );
}
