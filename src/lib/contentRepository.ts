import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, or, sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import {
  blogs,
  categories,
  galleries,
  products,
  teamMembers,
  testimonials,
} from "@/db/schema";
import { plainTextToBlogRichText } from "@/lib/blogRichText";
import { createUniqueContentSlug } from "@/lib/contentSlug";
import {
  blogDraftSchema,
  categoryDraftSchema,
  contentStoreSchema,
  galleryDraftSchema,
  productDraftSchema,
  testimonialDraftSchema,
  teamMemberDraftSchema,
  type BlogDraft,
  type CategoryDraft,
  type GalleryDraft,
  type ProductDraft,
  type TestimonialDraft,
  type TeamMemberDraft,
} from "@/lib/contentValidation";
import type { BlogPost } from "@/types/blog";
import type { Category } from "@/types/category";
import type { GalleryItem } from "@/types/gallery";
import type { Product } from "@/types/product";
import type { TeamMember } from "@/types/team";
import type { Testimonial } from "@/types/testimonial";

type DatabaseTransaction = Parameters<
  Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]
>[0];

const emptyStoredData = {
  version: 1 as const,
  catalogInitialized: true,
  blogs: [],
  galleries: [],
  products: [],
  categories: [],
  testimonials: [],
  teamMembers: [],
};

function validateStoredData(
  values: Partial<{
    blogs: unknown[];
    galleries: unknown[];
    products: unknown[];
    categories: unknown[];
    testimonials: unknown[];
    teamMembers: unknown[];
  }>,
) {
  return contentStoreSchema.parse({ ...emptyStoredData, ...values });
}

function lockedTransaction<T>(
  lockName: "blogs" | "catalog" | "galleries" | "team" | "testimonials",
  operation: (transaction: DatabaseTransaction) => Promise<T>,
) {
  return getDatabase().transaction(async (transaction) => {
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`gtbs-content-${lockName}`}))`,
    );
    return operation(transaction);
  });
}

function blogFromDraft(
  id: string,
  slug: string,
  draft: BlogDraft,
  previous?: BlogPost,
): BlogPost {
  const parsed = blogDraftSchema.parse(draft);
  const paragraphs = parsed.contentText
    .split(/\n\s*\n/gu)
    .map((body) => body.trim())
    .filter(Boolean);
  const firstParagraph = paragraphs[0]?.replace(/\s+/gu, " ").trim() ?? "";
  const fallbackSummary = firstParagraph.slice(0, 200) || parsed.title;
  const gujaratiParagraphs = parsed.gujarati.contentText
    .split(/\n\s*\n/gu)
    .map((body) => body.trim())
    .filter(Boolean);
  const gujaratiSummary =
    gujaratiParagraphs[0]?.replace(/\s+/gu, " ").trim().slice(0, 200) ||
    parsed.gujarati.title;

  return {
    id,
    title: parsed.title,
    slug,
    category: parsed.category,
    date: parsed.date,
    image: parsed.image,
    imageKey: parsed.imageKey,
    summary: parsed.summary?.trim() || fallbackSummary,
    author: {
      ...parsed.author,
      avatar: parsed.author.avatar || "/images/logo/logo.webp",
      bio: parsed.author.bio ?? "",
    },
    tags: parsed.tags ?? [],
    richContent:
      parsed.richContent ?? plainTextToBlogRichText(parsed.contentText),
    content: paragraphs.map((body) => ({ body })),
    gujarati: {
      title: parsed.gujarati.title,
      category: parsed.gujarati.category,
      summary: gujaratiSummary,
      author: parsed.gujarati.author,
      richContent:
        parsed.gujarati.richContent ??
        plainTextToBlogRichText(parsed.gujarati.contentText),
      content: gujaratiParagraphs.map((body) => ({ body })),
    },
    ...(previous?.comments ? { comments: previous.comments } : {}),
  };
}

export async function getBlogs() {
  const rows = await getDatabase()
    .select({ data: blogs.data })
    .from(blogs)
    .orderBy(asc(blogs.position), asc(blogs.createdAt));
  return validateStoredData({ blogs: rows.map((row) => row.data) }).blogs;
}

export async function getBlog(identifier: string) {
  const rows = await getDatabase()
    .select({ data: blogs.data })
    .from(blogs)
    .where(or(eq(blogs.id, identifier), eq(blogs.slug, identifier)))
    .limit(1);
  return rows[0]
    ? validateStoredData({ blogs: [rows[0].data] }).blogs[0]
    : undefined;
}

export function createBlog(draft: BlogDraft) {
  return lockedTransaction("blogs", async (transaction) => {
    const parsed = blogDraftSchema.parse(draft);
    const existing = await transaction.select({ slug: blogs.slug }).from(blogs);
    const slug = createUniqueContentSlug(
      parsed.title,
      existing.map((blog) => blog.slug),
      "blog",
    );
    const blog = blogFromDraft(randomUUID(), slug, parsed);
    await transaction
      .update(blogs)
      .set({ position: sql`${blogs.position} + 1` });
    await transaction.insert(blogs).values({
      id: String(blog.id),
      slug,
      position: 0,
      data: blog,
    });
    return blog;
  });
}

export function updateBlog(id: string, draft: BlogDraft) {
  return lockedTransaction("blogs", async (transaction) => {
    const existing = await transaction
      .select({ data: blogs.data })
      .from(blogs)
      .where(eq(blogs.id, id))
      .limit(1);
    if (!existing[0]) return null;
    const previous = validateStoredData({ blogs: [existing[0].data] }).blogs[0];
    const blog = blogFromDraft(id, previous.slug, draft, previous);
    await transaction
      .update(blogs)
      .set({ data: blog, updatedAt: new Date() })
      .where(eq(blogs.id, id));
    return blog;
  });
}

export function deleteBlog(id: string) {
  return lockedTransaction("blogs", async (transaction) => {
    const deleted = await transaction
      .delete(blogs)
      .where(eq(blogs.id, id))
      .returning({ data: blogs.data });
    return deleted[0]
      ? validateStoredData({ blogs: [deleted[0].data] }).blogs[0]
      : null;
  });
}

export async function getGalleries() {
  const rows = await getDatabase()
    .select({ data: galleries.data })
    .from(galleries)
    .orderBy(asc(galleries.position), asc(galleries.createdAt));
  return validateStoredData({ galleries: rows.map((row) => row.data) })
    .galleries;
}

export async function getGallery(identifier: string) {
  const rows = await getDatabase()
    .select({ data: galleries.data })
    .from(galleries)
    .where(or(eq(galleries.id, identifier), eq(galleries.slug, identifier)))
    .limit(1);
  return rows[0]
    ? validateStoredData({ galleries: [rows[0].data] }).galleries[0]
    : undefined;
}

export function createGallery(draft: GalleryDraft) {
  return lockedTransaction("galleries", async (transaction) => {
    const parsed = galleryDraftSchema.parse(draft);
    const existing = await transaction
      .select({ slug: galleries.slug })
      .from(galleries);
    const slug = createUniqueContentSlug(
      parsed.title,
      existing.map((gallery) => gallery.slug),
      "gallery",
    );
    const gallery: GalleryItem = { ...parsed, id: randomUUID(), slug };
    await transaction
      .update(galleries)
      .set({ position: sql`${galleries.position} + 1` });
    await transaction.insert(galleries).values({
      id: String(gallery.id),
      slug,
      position: 0,
      data: gallery,
    });
    return gallery;
  });
}

export function updateGallery(id: string, draft: GalleryDraft) {
  return lockedTransaction("galleries", async (transaction) => {
    const existing = await transaction
      .select({ data: galleries.data })
      .from(galleries)
      .where(eq(galleries.id, id))
      .limit(1);
    if (!existing[0]) return null;
    const previous = validateStoredData({ galleries: [existing[0].data] })
      .galleries[0];
    const parsed = galleryDraftSchema.parse(draft);
    const gallery: GalleryItem = {
      ...parsed,
      id: String(previous.id),
      slug: previous.slug,
    };
    await transaction
      .update(galleries)
      .set({ data: gallery, updatedAt: new Date() })
      .where(eq(galleries.id, id));
    return gallery;
  });
}

export function deleteGallery(id: string) {
  return lockedTransaction("galleries", async (transaction) => {
    const deleted = await transaction
      .delete(galleries)
      .where(eq(galleries.id, id))
      .returning({ data: galleries.data });
    return deleted[0]
      ? validateStoredData({ galleries: [deleted[0].data] }).galleries[0]
      : null;
  });
}

export async function getTestimonials() {
  const rows = await getDatabase()
    .select({ data: testimonials.data })
    .from(testimonials)
    .orderBy(asc(testimonials.position), asc(testimonials.createdAt));
  return validateStoredData({ testimonials: rows.map((row) => row.data) })
    .testimonials;
}

export async function getTestimonial(id: string) {
  const rows = await getDatabase()
    .select({ data: testimonials.data })
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);
  return rows[0]
    ? validateStoredData({ testimonials: [rows[0].data] }).testimonials[0]
    : undefined;
}

export function createTestimonial(draft: TestimonialDraft) {
  return lockedTransaction("testimonials", async (transaction) => {
    const parsed = testimonialDraftSchema.parse(draft);
    const testimonial: Testimonial = { ...parsed, id: randomUUID() };
    await transaction
      .update(testimonials)
      .set({ position: sql`${testimonials.position} + 1` });
    await transaction.insert(testimonials).values({
      id: testimonial.id,
      position: 0,
      data: testimonial,
    });
    return testimonial;
  });
}

export function updateTestimonial(id: string, draft: TestimonialDraft) {
  return lockedTransaction("testimonials", async (transaction) => {
    const existing = await transaction
      .select({ data: testimonials.data })
      .from(testimonials)
      .where(eq(testimonials.id, id))
      .limit(1);
    if (!existing[0]) return null;
    const previous = validateStoredData({ testimonials: [existing[0].data] })
      .testimonials[0];
    const parsed = testimonialDraftSchema.parse(draft);
    const testimonial: Testimonial = { ...parsed, id: previous.id };
    await transaction
      .update(testimonials)
      .set({ data: testimonial, updatedAt: new Date() })
      .where(eq(testimonials.id, id));
    return testimonial;
  });
}

export function deleteTestimonial(id: string) {
  return lockedTransaction("testimonials", async (transaction) => {
    const deleted = await transaction
      .delete(testimonials)
      .where(eq(testimonials.id, id))
      .returning({ data: testimonials.data });
    return deleted[0]
      ? validateStoredData({ testimonials: [deleted[0].data] }).testimonials[0]
      : null;
  });
}

export async function getTeamMembers() {
  const rows = await getDatabase()
    .select({ data: teamMembers.data })
    .from(teamMembers)
    .orderBy(asc(teamMembers.position), asc(teamMembers.createdAt));
  return validateStoredData({ teamMembers: rows.map((row) => row.data) })
    .teamMembers;
}

export async function getTeamMember(id: string) {
  const rows = await getDatabase()
    .select({ data: teamMembers.data })
    .from(teamMembers)
    .where(eq(teamMembers.id, id))
    .limit(1);
  return rows[0]
    ? validateStoredData({ teamMembers: [rows[0].data] }).teamMembers[0]
    : undefined;
}

export function createTeamMember(draft: TeamMemberDraft) {
  return lockedTransaction("team", async (transaction) => {
    const parsed = teamMemberDraftSchema.parse(draft);
    const member: TeamMember = { ...parsed, id: randomUUID() };
    const last = await transaction
      .select({ position: teamMembers.position })
      .from(teamMembers)
      .orderBy(desc(teamMembers.position))
      .limit(1);
    await transaction.insert(teamMembers).values({
      id: member.id,
      position: (last[0]?.position ?? -1) + 1,
      data: member,
    });
    return member;
  });
}

export function updateTeamMember(id: string, draft: TeamMemberDraft) {
  return lockedTransaction("team", async (transaction) => {
    const existing = await transaction
      .select({ data: teamMembers.data })
      .from(teamMembers)
      .where(eq(teamMembers.id, id))
      .limit(1);
    if (!existing[0]) return null;
    const previous = validateStoredData({ teamMembers: [existing[0].data] })
      .teamMembers[0];
    const parsed = teamMemberDraftSchema.parse(draft);
    const member: TeamMember = { ...parsed, id: previous.id };
    await transaction
      .update(teamMembers)
      .set({ data: member, updatedAt: new Date() })
      .where(eq(teamMembers.id, id));
    return member;
  });
}

export function deleteTeamMember(id: string) {
  return lockedTransaction("team", async (transaction) => {
    const deleted = await transaction
      .delete(teamMembers)
      .where(eq(teamMembers.id, id))
      .returning({ data: teamMembers.data });
    return deleted[0]
      ? validateStoredData({ teamMembers: [deleted[0].data] }).teamMembers[0]
      : null;
  });
}

function productFromDraft(id: string, draft: ProductDraft): Product {
  const parsed = productDraftSchema.parse(draft);
  return { ...parsed, id };
}

export async function getProducts() {
  const rows = await getDatabase()
    .select({ data: products.data })
    .from(products)
    .orderBy(asc(products.position), asc(products.createdAt));
  return validateStoredData({ products: rows.map((row) => row.data) }).products;
}

export async function getProduct(id: string) {
  const rows = await getDatabase()
    .select({ data: products.data })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return rows[0]
    ? validateStoredData({ products: [rows[0].data] }).products[0]
    : undefined;
}

export function createProduct(draft: ProductDraft) {
  return lockedTransaction("catalog", async (transaction) => {
    const parsed = productDraftSchema.parse(draft);
    const category = await transaction
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, parsed.category))
      .limit(1);
    if (!category[0]) throw new Error("Choose an existing category.");
    const existing = await transaction
      .select({ id: products.id })
      .from(products);
    const id = createUniqueContentSlug(
      parsed.title,
      existing.map((product) => product.id),
      "product",
    );
    const product = productFromDraft(id, parsed);
    await transaction
      .update(products)
      .set({ position: sql`${products.position} + 1` });
    await transaction.insert(products).values({
      id,
      categorySlug: product.category,
      position: 0,
      data: product,
    });
    return product;
  });
}

export function updateProduct(id: string, draft: ProductDraft) {
  return lockedTransaction("catalog", async (transaction) => {
    const existing = await transaction
      .select({ data: products.data })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!existing[0]) return null;
    const parsed = productDraftSchema.parse(draft);
    const category = await transaction
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, parsed.category))
      .limit(1);
    if (!category[0]) throw new Error("Choose an existing category.");
    const previous = validateStoredData({ products: [existing[0].data] })
      .products[0];
    const product: Product = {
      ...productFromDraft(previous.id, parsed),
      reviews: previous.reviews,
    };
    await transaction
      .update(products)
      .set({
        categorySlug: product.category,
        data: product,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
    return product;
  });
}

export function deleteProduct(id: string) {
  return lockedTransaction("catalog", async (transaction) => {
    const deleted = await transaction
      .delete(products)
      .where(eq(products.id, id))
      .returning({ data: products.data });
    return deleted[0]
      ? validateStoredData({ products: [deleted[0].data] }).products[0]
      : null;
  });
}

export async function getCategories() {
  const rows = await getDatabase()
    .select({ data: categories.data })
    .from(categories)
    .orderBy(asc(categories.position), asc(categories.createdAt));
  return validateStoredData({ categories: rows.map((row) => row.data) })
    .categories;
}

async function applyCategoryOrder(
  transaction: DatabaseTransaction,
  orderedCategories: Category[],
  updatedId?: string,
) {
  for (const [position, category] of orderedCategories.entries()) {
    await transaction
      .update(categories)
      .set({
        position,
        ...(category.id === updatedId
          ? { data: category, updatedAt: new Date() }
          : {}),
      })
      .where(eq(categories.id, category.id));
  }
}

export function createCategory(draft: CategoryDraft) {
  return lockedTransaction("catalog", async (transaction) => {
    const parsed = categoryDraftSchema.parse(draft);
    const existingRows = await transaction
      .select({ data: categories.data })
      .from(categories);
    const existing = validateStoredData({
      categories: existingRows.map((row) => row.data),
    }).categories;
    const slug = createUniqueContentSlug(
      parsed.name,
      existing.map((category) => category.slug),
      "category",
    );
    const category: Category = { ...parsed, id: randomUUID(), slug };
    const ordered = [...existing, category].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
    await transaction.insert(categories).values({
      id: category.id,
      slug,
      position: ordered.findIndex((item) => item.id === category.id),
      data: category,
    });
    await applyCategoryOrder(transaction, ordered);
    return category;
  });
}

export function updateCategory(id: string, draft: CategoryDraft) {
  return lockedTransaction("catalog", async (transaction) => {
    const existingRows = await transaction
      .select({ data: categories.data })
      .from(categories);
    const existing = validateStoredData({
      categories: existingRows.map((row) => row.data),
    }).categories;
    const previous = existing.find((category) => category.id === id);
    if (!previous) return null;
    const parsed = categoryDraftSchema.parse(draft);
    const category: Category = {
      ...parsed,
      id: previous.id,
      slug: previous.slug,
    };
    const ordered = existing
      .map((item) => (item.id === id ? category : item))
      .sort((left, right) => left.name.localeCompare(right.name));
    await applyCategoryOrder(transaction, ordered, id);
    return category;
  });
}

export function deleteCategory(id: string) {
  return lockedTransaction("catalog", async (transaction) => {
    const existing = await transaction
      .select({ data: categories.data, slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    if (!existing[0]) return null;
    const assignedProduct = await transaction
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categorySlug, existing[0].slug))
      .limit(1);
    if (assignedProduct[0]) {
      throw new Error("Move or delete the products in this category first.");
    }
    const deleted = await transaction
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.slug, existing[0].slug)))
      .returning({ data: categories.data });
    return deleted[0]
      ? validateStoredData({ categories: [deleted[0].data] }).categories[0]
      : null;
  });
}
