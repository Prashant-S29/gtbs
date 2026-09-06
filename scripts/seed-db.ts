import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";

import { closeDatabaseConnection, getDatabase } from "../src/db/client";
import {
  blogs,
  categories,
  galleries,
  products,
  settings,
  teamMembers,
  testimonials,
} from "../src/db/schema";
import { categories as seededCategories } from "../src/data/categories";
import { products as seededProducts } from "../src/data/products";
import { teamMembers as seededTeamMembers } from "../src/data/team";
import { testimonials as seededTestimonials } from "../src/data/testimonials";
import { contentStoreSchema } from "../src/lib/contentValidation";

config({ quiet: true });

const initializationKey = "content_initialized";

function defaultContent() {
  return contentStoreSchema.parse({
    version: 1,
    catalogInitialized: true,
    blogs: [],
    galleries: [],
    products: seededProducts,
    categories: seededCategories,
    testimonials: seededTestimonials,
    teamMembers: seededTeamMembers,
  });
}

async function main() {
  const database = getDatabase();
  const seed = { source: "committed seeds", content: defaultContent() };

  const result = await database.transaction(async (transaction) => {
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtext('gtbs-content-seed'))`,
    );
    const initialized = await transaction
      .select({ key: settings.key })
      .from(settings)
      .where(eq(settings.key, initializationKey))
      .limit(1);
    if (initialized[0]) return { seeded: false as const };

    if (seed.content.categories.length > 0) {
      await transaction.insert(categories).values(
        seed.content.categories.map((category, position) => ({
          id: category.id,
          slug: category.slug,
          position,
          data: category,
        })),
      );
    }
    if (seed.content.products.length > 0) {
      await transaction.insert(products).values(
        seed.content.products.map((product, position) => ({
          id: product.id,
          categorySlug: product.category,
          position,
          data: product,
        })),
      );
    }
    if (seed.content.blogs.length > 0) {
      await transaction.insert(blogs).values(
        seed.content.blogs.map((blog, position) => ({
          id: String(blog.id),
          slug: blog.slug,
          position,
          data: blog,
        })),
      );
    }
    if (seed.content.galleries.length > 0) {
      await transaction.insert(galleries).values(
        seed.content.galleries.map((gallery, position) => ({
          id: String(gallery.id),
          slug: gallery.slug,
          position,
          data: gallery,
        })),
      );
    }
    if (seed.content.testimonials.length > 0) {
      await transaction.insert(testimonials).values(
        seed.content.testimonials.map((testimonial, position) => ({
          id: testimonial.id,
          position,
          data: testimonial,
        })),
      );
    }
    if (seed.content.teamMembers.length > 0) {
      await transaction.insert(teamMembers).values(
        seed.content.teamMembers.map((member, position) => ({
          id: member.id,
          position,
          data: member,
        })),
      );
    }

    await transaction.insert(settings).values({
      key: initializationKey,
      value: { version: 1, source: seed.source },
    });

    return {
      seeded: true as const,
      counts: {
        categories: seed.content.categories.length,
        products: seed.content.products.length,
        blogs: seed.content.blogs.length,
        galleries: seed.content.galleries.length,
        testimonials: seed.content.testimonials.length,
        teamMembers: seed.content.teamMembers.length,
      },
    };
  });

  if (!result.seeded) {
    console.log("Database content is already initialized; seed skipped.");
    return;
  }
  console.log(`Database seeded from ${seed.source}.`);
  console.log(result.counts);
}

main()
  .catch((error: unknown) => {
    console.error(
      `Database seed failed: ${error instanceof Error ? error.message : "Unknown database error"}`,
    );
    process.exitCode = 1;
  })
  .finally(closeDatabaseConnection);
