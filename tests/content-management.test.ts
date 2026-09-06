import assert from "node:assert/strict";
import test from "node:test";

import { testimonials } from "../src/data/testimonials.ts";
import { teamMembers } from "../src/data/team.ts";
import {
  blogDraftSchema,
  categoryDraftSchema,
  contentStoreSchema,
  galleryDraftSchema,
  MAX_BLOG_DRAFT_BODY_BYTES,
  productDraftSchema,
  testimonialDraftSchema,
  teamMemberDraftSchema,
} from "../src/lib/contentValidation.ts";
import {
  MAX_GALLERY_PHOTOS,
  MAX_IMAGE_BYTES,
  validateImageSelection,
} from "../src/lib/imageRules.ts";
import { localizeBlog } from "../src/lib/localizedBlog.ts";
import { localizeCategory } from "../src/lib/localizedCategory.ts";
import { localizeGallery } from "../src/lib/localizedGallery.ts";
import { localizeProduct } from "../src/lib/localizedProduct.ts";
import { localizeTestimonial } from "../src/lib/localizedTestimonial.ts";
import { localizeTeamMember } from "../src/lib/localizedTeam.ts";
import { JsonBodyError, readBoundedJson } from "../src/lib/boundedJson.ts";
import {
  createUniqueContentSlug,
  slugifyContentTitle,
} from "../src/lib/contentSlug.ts";
import type { BlogPost } from "../src/types/blog.ts";
import type { GalleryItem } from "../src/types/gallery.ts";
import type { Product } from "../src/types/product.ts";
import type { Testimonial } from "../src/types/testimonial.ts";
import type { TeamMember } from "../src/types/team.ts";

const blogDraft = {
  title: "A valid article",
  category: "News",
  date: "2026-09-01",
  image: "https://example.com/banner.webp",
  summary: "A useful summary.",
  author: {
    name: "GTBS Editorial Team",
    role: "Editor",
    avatar: "/images/logo/logo.webp",
    bio: "",
  },
  tags: ["News"],
  contentText: "Article body.",
  gujarati: {
    title: "માન્ય લેખ",
    category: "સમાચાર",
    author: {
      name: "જીટીબીએસ સંપાદકીય ટીમ",
      role: "સંપાદક",
      bio: "",
    },
    contentText: "લેખનું લખાણ.",
  },
};

const richContent = {
  type: "doc" as const,
  content: [
    {
      type: "heading" as const,
      attrs: { level: 2 },
      content: [{ type: "text" as const, text: "A useful heading" }],
    },
    {
      type: "paragraph" as const,
      content: [
        {
          type: "text" as const,
          text: "Formatted article body.",
          marks: [{ type: "bold" as const }],
        },
      ],
    },
  ],
};

const galleryDraft = {
  title: "Community event",
  category: "Events",
  date: "2026-09-01",
  location: "Ahmedabad",
  coverImage: "https://example.com/cover.webp",
  description: "Event description.",
  organizer: "GTBS Community Team",
  photos: [],
  gujarati: {
    title: "સમુદાય કાર્યક્રમ",
    category: "કાર્યક્રમો",
    location: "અમદાવાદ",
    description: "કાર્યક્રમનું વર્ણન.",
    organizer: "જીટીબીએસ સમુદાય ટીમ",
  },
};

const categoryDraft = {
  name: "Devotionals",
  gujarati: {
    name: "દૈનિક ભક્તિ",
  },
};

const productDraft = {
  title: "Daily Devotional",
  price: 499,
  image: "/images/products/atomic-habits.jpg",
  detailImages: [
    {
      id: "detail-1",
      url: "/images/products/atomic-habits-detail.jpg",
      title: "Detail view",
    },
  ],
  category: "devotionals",
  badge: "New Releases",
  specifications: [{ name: "Material", value: "Paper" }],
  variants: [{ name: "Edition", options: ["Standard", "Gift"] }],
  features: ["One reflection for every day"],
  gujarati: {
    title: "દૈનિક ભક્તિ",
    specifications: [{ name: "સામગ્રી", value: "કાગળ" }],
    variants: [{ name: "આવૃત્તિ", options: ["પ્રમાણભૂત", "ભેટ"] }],
    features: ["દરેક દિવસ માટે એક મનન"],
  },
};

const testimonialDraft = {
  name: "Grace P.",
  role: "Verified Buyer",
  review: "The books arrived quickly and in excellent condition.",
  rating: 5,
  gujarati: {
    name: "ગ્રેસ પી.",
    role: "ચકાસાયેલ ખરીદદાર",
    review: "પુસ્તકો ઝડપથી અને ખૂબ સારી સ્થિતિમાં મળ્યાં.",
  },
};

const teamMemberDraft = {
  name: "Ruth Patel",
  role: "Community Partnerships Lead",
  image: "https://example.com/ruth.webp",
  gujarati: {
    name: "રુથ પટેલ",
    role: "સમુદાય ભાગીદારી વડા",
  },
};

test("accepts valid blog and gallery drafts", () => {
  assert.equal(blogDraftSchema.safeParse(blogDraft).success, true);
  assert.equal(galleryDraftSchema.safeParse(galleryDraft).success, true);
});

test("accepts valid category and product drafts", () => {
  assert.equal(categoryDraftSchema.safeParse(categoryDraft).success, true);
  assert.equal(productDraftSchema.safeParse(productDraft).success, true);
});

test("requires bounded Gujarati Category content while accepting legacy stored categories", () => {
  assert.equal(
    categoryDraftSchema.safeParse({ ...categoryDraft, gujarati: undefined })
      .success,
    false,
  );
  assert.equal(
    contentStoreSchema.safeParse({
      version: 1,
      blogs: [],
      galleries: [],
      products: [],
      categories: [{ id: "legacy", name: "Legacy", slug: "legacy" }],
      testimonials: [],
      teamMembers: [],
      catalogInitialized: true,
    }).success,
    true,
  );

  const storedCategory = {
    ...categoryDraft,
    id: "devotionals",
    slug: "devotionals",
  };
  assert.equal(localizeCategory(storedCategory, "gu").name, "દૈનિક ભક્તિ");
  assert.equal(localizeCategory(storedCategory, "en"), storedCategory);
});

test("creates bounded collision-safe slugs from backend content titles", () => {
  assert.equal(
    slugifyContentTitle("  Daily Devotional!  "),
    "daily-devotional",
  );
  assert.equal(
    createUniqueContentSlug(
      "Daily Devotional",
      ["daily-devotional", "daily-devotional-2"],
      "product",
    ),
    "daily-devotional-3",
  );
  assert.equal(createUniqueContentSlug("ગુજરાતી", [], "blog"), "blog");
  assert.ok(slugifyContentTitle("a".repeat(300)).length <= 220);
});

test("requires Gujarati Product content and selects it without changing shared fields", () => {
  assert.equal(
    productDraftSchema.safeParse({ ...productDraft, gujarati: undefined })
      .success,
    false,
  );

  const localized = localizeProduct(productDraft as Product, "gu");
  assert.equal(localized.title, "દૈનિક ભક્તિ");
  assert.deepEqual(localized.specifications, [
    { name: "સામગ્રી", value: "કાગળ" },
  ]);
  assert.deepEqual(localized.variants, [
    { name: "આવૃત્તિ", options: ["પ્રમાણભૂત", "ભેટ"] },
  ]);
  assert.equal(localized.price, productDraft.price);
  assert.equal(localized.image, productDraft.image);
  assert.equal(localized.category, productDraft.category);
});

test("validates bilingual Testimonial drafts and selects stored Gujarati content", () => {
  assert.equal(
    testimonialDraftSchema.safeParse(testimonialDraft).success,
    true,
  );
  assert.equal(
    testimonialDraftSchema.safeParse({
      ...testimonialDraft,
      gujarati: undefined,
    }).success,
    false,
  );
  assert.equal(
    testimonialDraftSchema.safeParse({ ...testimonialDraft, rating: 6 })
      .success,
    false,
  );

  const storedTestimonial: Testimonial = {
    ...testimonialDraft,
    id: "testimonial-1",
  };
  const localized = localizeTestimonial(storedTestimonial, "gu");
  assert.equal(localized.name, "ગ્રેસ પી.");
  assert.equal(localized.role, "ચકાસાયેલ ખરીદદાર");
  assert.equal(
    localized.review,
    "પુસ્તકો ઝડપથી અને ખૂબ સારી સ્થિતિમાં મળ્યાં.",
  );
  assert.equal(localized.rating, testimonialDraft.rating);
  assert.equal(localizeTestimonial(storedTestimonial, "en"), storedTestimonial);
});

test("accepts the seeded bilingual Testimonials in the persisted store schema", () => {
  const parsed = contentStoreSchema.safeParse({
    version: 1,
    blogs: [],
    galleries: [],
    testimonials,
  });
  assert.equal(parsed.success, true);
});

test("validates bilingual Team drafts and selects stored Gujarati content", () => {
  assert.equal(teamMemberDraftSchema.safeParse(teamMemberDraft).success, true);
  assert.equal(
    teamMemberDraftSchema.safeParse({
      ...teamMemberDraft,
      gujarati: undefined,
    }).success,
    false,
  );
  assert.equal(
    teamMemberDraftSchema.safeParse({ ...teamMemberDraft, image: "" }).success,
    false,
  );

  const storedMember: TeamMember = {
    ...teamMemberDraft,
    id: "team-member-5",
  };
  const localized = localizeTeamMember(storedMember, "gu");
  assert.equal(localized.name, "રુથ પટેલ");
  assert.equal(localized.role, "સમુદાય ભાગીદારી વડા");
  assert.equal(localized.image, teamMemberDraft.image);
  assert.equal(localized.id, storedMember.id);
  assert.equal(localizeTeamMember(storedMember, "en"), storedMember);
});

test("accepts the seeded bilingual Team in the persisted store schema", () => {
  const parsed = contentStoreSchema.safeParse({
    version: 1,
    blogs: [],
    galleries: [],
    teamMembers,
  });
  assert.equal(parsed.success, true);
});

test("rejects malformed catalog fields", () => {
  assert.equal(
    productDraftSchema.safeParse({ ...productDraft, id: "client-product-id" })
      .success,
    false,
  );
  assert.equal(
    categoryDraftSchema.safeParse({ ...categoryDraft, slug: "Bad Category" })
      .success,
    false,
  );
  assert.equal(
    categoryDraftSchema.safeParse({
      ...categoryDraft,
      description: "Removed field",
    }).success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({ ...productDraft, price: -1 }).success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({ ...productDraft, originalPrice: 599 })
      .success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({ ...productDraft, badge: "Custom badge" })
      .success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({ ...productDraft, author: "Removed field" })
      .success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({
      ...productDraft,
      authorBio: "Removed field",
    }).success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({
      ...productDraft,
      images: ["/images/legacy.jpg"],
    }).success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({
      ...productDraft,
      detailImages: Array.from({ length: 7 }, (_, index) => ({
        id: `detail-${index}`,
        url: `/images/detail-${index}.jpg`,
        title: `Detail ${index}`,
      })),
    }).success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({ ...productDraft, stockCount: 10 }).success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({ ...productDraft, rating: 5 }).success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({ ...productDraft, format: ["Paperback"] })
      .success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({
      ...productDraft,
      variants: [{ name: "Size", options: [] }],
    }).success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({ ...productDraft, category: "Bad Category" })
      .success,
    false,
  );
  assert.equal(
    productDraftSchema.safeParse({
      ...productDraft,
      image: "https://example.com/book.jpg",
    }).success,
    false,
  );
});

test("requires Gujarati Gallery content and rejects the removed Subtitle field", () => {
  assert.equal(
    galleryDraftSchema.safeParse({ ...galleryDraft, gujarati: undefined })
      .success,
    false,
  );
  assert.equal(
    galleryDraftSchema.safeParse({
      ...galleryDraft,
      subtitle: "Removed field",
    }).success,
    false,
  );
});

test("selects stored Gujarati Gallery content without changing shared fields", () => {
  const storedGallery: GalleryItem = {
    id: "gallery-1",
    slug: "community-event",
    title: galleryDraft.title,
    category: galleryDraft.category,
    date: galleryDraft.date,
    location: galleryDraft.location,
    coverImage: galleryDraft.coverImage,
    description: galleryDraft.description,
    organizer: galleryDraft.organizer,
    photos: galleryDraft.photos,
    gujarati: galleryDraft.gujarati,
  };

  const localized = localizeGallery(storedGallery, "gu");
  assert.equal(localized.title, "સમુદાય કાર્યક્રમ");
  assert.equal(localized.category, "કાર્યક્રમો");
  assert.equal(localized.location, "અમદાવાદ");
  assert.equal(localized.description, "કાર્યક્રમનું વર્ણન.");
  assert.equal(localized.slug, storedGallery.slug);
  assert.equal(localizeGallery(storedGallery, "en"), storedGallery);
});

test("requires complete Gujarati fields on blog drafts", () => {
  assert.equal(
    blogDraftSchema.safeParse({ ...blogDraft, gujarati: undefined }).success,
    false,
  );
  assert.equal(
    blogDraftSchema.safeParse({
      ...blogDraft,
      gujarati: { ...blogDraft.gujarati, contentText: "" },
    }).success,
    false,
  );
});

test("allows the bounded bilingual Blog body above the default JSON limit", async () => {
  const payload = JSON.stringify({ value: "x".repeat(140 * 1024) });
  const makeRequest = () =>
    new Request("https://example.com/api/admin/content/blogs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
    });

  await assert.rejects(
    () => readBoundedJson(makeRequest()),
    (error: unknown) => error instanceof JsonBodyError && error.status === 413,
  );
  assert.deepEqual(
    await readBoundedJson(makeRequest(), MAX_BLOG_DRAFT_BODY_BYTES),
    JSON.parse(payload),
  );
});

test("selects stored Gujarati blog content without changing shared fields", () => {
  const storedBlog: BlogPost = {
    id: "blog-1",
    title: blogDraft.title,
    slug: "a-valid-article",
    category: blogDraft.category,
    date: blogDraft.date,
    image: blogDraft.image,
    summary: blogDraft.summary,
    author: blogDraft.author,
    content: [{ body: blogDraft.contentText }],
    gujarati: {
      title: blogDraft.gujarati.title,
      category: blogDraft.gujarati.category,
      summary: blogDraft.gujarati.contentText,
      author: blogDraft.gujarati.author,
      content: [{ body: blogDraft.gujarati.contentText }],
    },
  };

  const localized = localizeBlog(storedBlog, "gu");
  assert.equal(localized.title, "માન્ય લેખ");
  assert.equal(localized.category, "સમાચાર");
  assert.equal(localized.content[0]?.body, "લેખનું લખાણ.");
  assert.equal(localized.slug, storedBlog.slug);
  assert.equal(localizeBlog(storedBlog, "en"), storedBlog);
});

test("accepts allow-listed Tiptap JSON and rejects unsafe rich content", () => {
  assert.equal(
    blogDraftSchema.safeParse({ ...blogDraft, richContent }).success,
    true,
  );
  assert.equal(
    blogDraftSchema.safeParse({
      ...blogDraft,
      gujarati: { ...blogDraft.gujarati, richContent },
    }).success,
    true,
  );

  const unsafeLink = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Unsafe link",
            marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
          },
        ],
      },
    ],
  };
  assert.equal(
    blogDraftSchema.safeParse({ ...blogDraft, richContent: unsafeLink })
      .success,
    false,
  );
  assert.equal(
    blogDraftSchema.safeParse({
      ...blogDraft,
      gujarati: { ...blogDraft.gujarati, richContent: unsafeLink },
    }).success,
    false,
  );
  assert.equal(
    blogDraftSchema.safeParse({
      ...blogDraft,
      richContent: { type: "doc", content: [{ type: "iframe" }] },
    }).success,
    false,
  );
});

test("accepts blog drafts without tags or author bio", () => {
  const draftWithoutCrudFields = {
    ...blogDraft,
    tags: undefined,
    author: {
      ...blogDraft.author,
      bio: undefined,
    },
  };

  assert.equal(blogDraftSchema.safeParse(draftWithoutCrudFields).success, true);
});

test("accepts blog drafts without explicit summary or author avatar", () => {
  const draftWithoutSummaryOrAvatar = {
    ...blogDraft,
    summary: undefined,
    author: {
      ...blogDraft.author,
      avatar: undefined,
    },
  };

  assert.equal(
    blogDraftSchema.safeParse(draftWithoutSummaryOrAvatar).success,
    true,
  );
});

test("accepts blank summary and avatar strings and normalizes them to defaults", () => {
  const blankValuesDraft = {
    ...blogDraft,
    summary: "",
    author: {
      ...blogDraft.author,
      avatar: "",
    },
  };

  const parsed = blogDraftSchema.safeParse(blankValuesDraft);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.summary, "");
    assert.equal(parsed.data.author.avatar, "/images/logo/logo.webp");
  }
});

test("accepts an empty editorial store without any committed fallback data", () => {
  const parsed = contentStoreSchema.safeParse({
    version: 1,
    blogs: [],
    galleries: [],
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.catalogInitialized, false);
    assert.deepEqual(parsed.data.products, []);
    assert.deepEqual(parsed.data.categories, []);
    assert.deepEqual(parsed.data.testimonials, []);
    assert.deepEqual(parsed.data.teamMembers, []);
  }
});

test("rejects client-owned identifiers and invalid dates", () => {
  assert.equal(
    blogDraftSchema.safeParse({ ...blogDraft, slug: "Bad Slug" }).success,
    false,
  );
  assert.equal(
    galleryDraftSchema.safeParse({ ...galleryDraft, slug: "client-gallery" })
      .success,
    false,
  );
  assert.equal(
    blogDraftSchema.safeParse({ ...blogDraft, date: "not-a-date" }).success,
    false,
  );
});

test("rejects more than twelve gallery photos", () => {
  const photos = Array.from({ length: MAX_GALLERY_PHOTOS + 1 }, (_, index) => ({
    id: String(index),
    url: `https://example.com/${index}.webp`,
    title: `Photo ${index}`,
  }));
  assert.equal(
    galleryDraftSchema.safeParse({ ...galleryDraft, photos }).success,
    false,
  );
});

test("enforces image type and 500 KB selection limit", () => {
  assert.equal(
    validateImageSelection({
      type: "image/jpeg",
      size: MAX_IMAGE_BYTES,
    } as File),
    null,
  );
  assert.match(
    validateImageSelection({
      type: "image/jpeg",
      size: MAX_IMAGE_BYTES + 1,
    } as File) || "",
    /500 KB/u,
  );
  assert.match(
    validateImageSelection({ type: "image/svg+xml", size: 100 } as File) || "",
    /Only JPG/u,
  );
});
