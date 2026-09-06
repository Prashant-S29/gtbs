import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import type { BlogPost } from "@/types/blog";
import type { Category } from "@/types/category";
import type { GalleryItem } from "@/types/gallery";
import type { Product } from "@/types/product";
import type { TeamMember } from "@/types/team";
import type { Testimonial } from "@/types/testimonial";

export const authUser = pgTable("auth_user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const authSession = pgTable(
  "auth_session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
  },
  (table) => [index("auth_session_user_id_idx").on(table.userId)],
);

export const authAccount = pgTable(
  "auth_account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("auth_account_user_id_idx").on(table.userId)],
);

export const authVerification = pgTable(
  "auth_verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("auth_verification_identifier_idx").on(table.identifier)],
);

export const authRateLimit = pgTable("auth_rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const emailRateLimits = pgTable("email_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

const recordTimestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  position: integer("position").notNull().default(0),
  data: jsonb("data").$type<Category>().notNull(),
  ...recordTimestamps,
});

export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 220 }).primaryKey(),
    categorySlug: varchar("category_slug", { length: 220 })
      .notNull()
      .references(() => categories.slug, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    position: integer("position").notNull().default(0),
    data: jsonb("data").$type<Product>().notNull(),
    ...recordTimestamps,
  },
  (table) => [
    index("products_category_position_idx").on(
      table.categorySlug,
      table.position,
    ),
  ],
);

export const blogs = pgTable(
  "blogs",
  {
    id: text("id").primaryKey(),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    position: integer("position").notNull().default(0),
    data: jsonb("data").$type<BlogPost>().notNull(),
    ...recordTimestamps,
  },
  (table) => [index("blogs_position_idx").on(table.position)],
);

export const galleries = pgTable(
  "galleries",
  {
    id: text("id").primaryKey(),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    position: integer("position").notNull().default(0),
    data: jsonb("data").$type<GalleryItem>().notNull(),
    ...recordTimestamps,
  },
  (table) => [index("galleries_position_idx").on(table.position)],
);

export const testimonials = pgTable(
  "testimonials",
  {
    id: text("id").primaryKey(),
    position: integer("position").notNull().default(0),
    data: jsonb("data").$type<Testimonial>().notNull(),
    ...recordTimestamps,
  },
  (table) => [index("testimonials_position_idx").on(table.position)],
);

export const teamMembers = pgTable(
  "team_members",
  {
    id: text("id").primaryKey(),
    position: integer("position").notNull().default(0),
    data: jsonb("data").$type<TeamMember>().notNull(),
    ...recordTimestamps,
  },
  (table) => [index("team_members_position_idx").on(table.position)],
);

export const settings = pgTable("gtbs_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
