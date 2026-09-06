import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { config } from "dotenv";
import { and, desc, eq, like } from "drizzle-orm";

import { closeDatabaseConnection, getDatabase } from "../src/db/client";
import { authUser, authVerification } from "../src/db/schema";
import { deleteUploadedImages } from "../src/lib/imageUpload";

config({ quiet: true });

const baseUrl = new URL(
  process.env.API_SMOKE_BASE_URL || "http://localhost:3000",
);
const origin = baseUrl.origin;
const adminEmail = process.env.ADMIN_EMAIL?.trim();
const adminPassword = process.env.API_SMOKE_ADMIN_PASSWORD;
let sessionCookie = "";
let uploadedKey: string | undefined;

interface RequestOptions {
  authenticated?: boolean;
  body?: FormData | object;
  method?: "DELETE" | "GET" | "POST" | "PUT";
  trusted?: boolean;
}

interface CreatedRecords {
  blog?: string;
  category?: string;
  gallery?: string;
  product?: string;
  teamMember?: string;
  testimonial?: string;
}

const created: CreatedRecords = {};

async function request(pathname: string, options: RequestOptions = {}) {
  const headers = new Headers();
  if (options.trusted !== false) {
    headers.set("origin", origin);
    headers.set("sec-fetch-site", "same-origin");
    headers.set("x-gtbs-admin-request", "1");
    headers.set("x-gtbs-public-request", "1");
  }
  if (options.authenticated !== false && sessionCookie) {
    headers.set("cookie", sessionCookie);
  }

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(options.body);
  }

  return fetch(new URL(pathname, baseUrl), {
    method: options.method || "GET",
    headers,
    body,
    redirect: "manual",
  });
}

async function expectStatus(
  label: string,
  response: Response,
  expected: number | number[],
) {
  const statuses = Array.isArray(expected) ? expected : [expected];
  if (!statuses.includes(response.status)) {
    const responseBody = await response.text();
    assert.fail(
      `${label}: expected ${statuses.join("/")}, received ${response.status}: ${responseBody.slice(0, 500)}`,
    );
  }
  console.log(`PASS ${label} (${response.status})`);
  return response;
}

async function jsonItem<T>(response: Response) {
  const payload = (await response.json()) as { item: T };
  assert.ok(payload.item);
  return payload.item;
}

function captureSessionCookie(response: Response) {
  const setCookie = response.headers.get("set-cookie") || "";
  const cookie = setCookie.match(
    /(?:__Secure-)?gtbs_admin\.session_token=[^;,]+/u,
  )?.[0];
  assert.ok(cookie, "Login did not return the Admin session cookie.");
  sessionCookie = cookie;
}

async function signIn(password: string, label: string) {
  const response = await expectStatus(
    label,
    await request("/api/auth/sign-in/email", {
      authenticated: false,
      body: { email: adminEmail, password, rememberMe: false },
      method: "POST",
    }),
    200,
  );
  captureSessionCookie(response);
}

async function login() {
  assert.ok(adminEmail, "ADMIN_EMAIL is required for the API smoke test.");
  assert.ok(
    adminPassword,
    "API_SMOKE_ADMIN_PASSWORD is required for the API smoke test.",
  );

  await expectStatus(
    "login rejects incorrect credentials",
    await request("/api/auth/sign-in/email", {
      authenticated: false,
      body: { email: adminEmail, password: `${adminPassword}-incorrect` },
      method: "POST",
    }),
    401,
  );

  await signIn(adminPassword, "login creates an Admin session");
}

async function verifyPublicReads() {
  for (const pathname of [
    "/api/content/catalog",
    "/api/content/blogs",
    "/api/content/galleries",
  ]) {
    const response = await expectStatus(
      `public GET ${pathname}`,
      await request(pathname, { authenticated: false, trusted: false }),
      200,
    );
    assert.match(response.headers.get("cache-control") || "", /no-store/u);
    await response.json();
  }
}

async function verifyProtectedEndpointsRejectMissingSession() {
  const endpoints: Array<[string, RequestOptions["method"]]> = [
    ["/api/admin/content/blogs", "POST"],
    ["/api/admin/content/blogs/missing", "PUT"],
    ["/api/admin/content/blogs/missing", "DELETE"],
    ["/api/admin/content/categories", "POST"],
    ["/api/admin/content/categories/missing", "PUT"],
    ["/api/admin/content/categories/missing", "DELETE"],
    ["/api/admin/content/galleries", "POST"],
    ["/api/admin/content/galleries/missing", "PUT"],
    ["/api/admin/content/galleries/missing", "DELETE"],
    ["/api/admin/content/products", "POST"],
    ["/api/admin/content/products/missing", "PUT"],
    ["/api/admin/content/products/missing", "DELETE"],
    ["/api/admin/content/team", "POST"],
    ["/api/admin/content/team/missing", "PUT"],
    ["/api/admin/content/team/missing", "DELETE"],
    ["/api/admin/content/testimonials", "POST"],
    ["/api/admin/content/testimonials/missing", "PUT"],
    ["/api/admin/content/testimonials/missing", "DELETE"],
    ["/api/admin/content/upload", "POST"],
  ];

  for (const [pathname, method] of endpoints) {
    await expectStatus(
      `${method} ${pathname} rejects a missing session`,
      await request(pathname, {
        authenticated: false,
        body: {},
        method,
      }),
      401,
    );
  }
}

async function verifyCrud() {
  const suffix = randomUUID().slice(0, 8);
  const date = new Date().toISOString().slice(0, 10);

  let response = await expectStatus(
    "create Category",
    await request("/api/admin/content/categories", {
      method: "POST",
      body: {
        name: `ZZZ API Smoke ${suffix}`,
        gujarati: { name: `API પરીક્ષણ ${suffix}` },
      },
    }),
    201,
  );
  const category = await jsonItem<{ id: string; slug: string }>(response);
  created.category = category.id;

  response = await expectStatus(
    "update Category",
    await request(`/api/admin/content/categories/${category.id}`, {
      method: "PUT",
      body: {
        name: `ZZZ API Smoke Updated ${suffix}`,
        gujarati: { name: `API પરીક્ષણ સુધારેલ ${suffix}` },
      },
    }),
    200,
  );
  assert.equal((await jsonItem<{ id: string }>(response)).id, category.id);

  const productDraft = {
    title: `API Smoke Product ${suffix}`,
    price: 199,
    image: "/images/products/book-placeholder.svg",
    category: category.slug,
    badge: "New Releases",
    specifications: [{ name: "Type", value: "Smoke test" }],
    variants: [{ name: "Edition", options: ["Standard"] }],
    features: ["Temporary API verification record"],
    gujarati: {
      title: `API ઉત્પાદન ${suffix}`,
      specifications: [{ name: "પ્રકાર", value: "પરીક્ષણ" }],
      variants: [{ name: "આવૃત્તિ", options: ["પ્રમાણભૂત"] }],
      features: ["અસ્થાયી પરીક્ષણ રેકોર્ડ"],
    },
  };
  response = await expectStatus(
    "create Product",
    await request("/api/admin/content/products", {
      method: "POST",
      body: productDraft,
    }),
    201,
  );
  const product = await jsonItem<{ id: string }>(response);
  created.product = product.id;

  response = await expectStatus(
    "update Product",
    await request(`/api/admin/content/products/${product.id}`, {
      method: "PUT",
      body: { ...productDraft, price: 249 },
    }),
    200,
  );
  assert.equal((await jsonItem<{ price: number }>(response)).price, 249);

  await expectStatus(
    "Category deletion is blocked while assigned",
    await request(`/api/admin/content/categories/${category.id}`, {
      method: "DELETE",
    }),
    409,
  );

  const blogDraft = {
    title: `API Smoke Blog ${suffix}`,
    category: "API verification",
    date,
    image: "/images/blog/blog.webp",
    author: {
      name: "GTBS API Test",
      role: "Verification",
      avatar: "/images/logo/logo.webp",
    },
    contentText: "Temporary article created by the API smoke test.",
    gujarati: {
      title: `API બ્લોગ ${suffix}`,
      category: "API ચકાસણી",
      author: { name: "GTBS API પરીક્ષણ", role: "ચકાસણી" },
      contentText: "API પરીક્ષણ દ્વારા બનાવેલ અસ્થાયી લેખ.",
    },
  };
  response = await expectStatus(
    "create Blog",
    await request("/api/admin/content/blogs", {
      method: "POST",
      body: blogDraft,
    }),
    201,
  );
  const blog = await jsonItem<{ id: string | number }>(response);
  created.blog = String(blog.id);
  response = await expectStatus(
    "update Blog",
    await request(`/api/admin/content/blogs/${blog.id}`, {
      method: "PUT",
      body: { ...blogDraft, title: `${blogDraft.title} Updated` },
    }),
    200,
  );
  assert.equal(
    String((await jsonItem<{ id: string | number }>(response)).id),
    String(blog.id),
  );

  const galleryDraft = {
    title: `API Smoke Gallery ${suffix}`,
    category: "API verification",
    date,
    location: "Ahmedabad",
    coverImage: "/images/blog/blog.webp",
    description: "Temporary gallery created by the API smoke test.",
    photos: [],
    gujarati: {
      title: `API ગેલેરી ${suffix}`,
      category: "API ચકાસણી",
      location: "અમદાવાદ",
      description: "API પરીક્ષણ દ્વારા બનાવેલ અસ્થાયી ગેલેરી.",
    },
  };
  response = await expectStatus(
    "create Gallery",
    await request("/api/admin/content/galleries", {
      method: "POST",
      body: galleryDraft,
    }),
    201,
  );
  const gallery = await jsonItem<{ id: string | number }>(response);
  created.gallery = String(gallery.id);
  response = await expectStatus(
    "update Gallery",
    await request(`/api/admin/content/galleries/${gallery.id}`, {
      method: "PUT",
      body: { ...galleryDraft, location: "Surat" },
    }),
    200,
  );
  assert.equal(
    (await jsonItem<{ location: string }>(response)).location,
    "Surat",
  );

  const testimonialDraft = {
    name: `API Customer ${suffix}`,
    role: "Verified tester",
    review: "Temporary testimonial created by the API smoke test.",
    rating: 5,
    gujarati: {
      name: `API ગ્રાહક ${suffix}`,
      role: "ચકાસાયેલ પરીક્ષક",
      review: "API પરીક્ષણ દ્વારા બનાવેલ અસ્થાયી અભિપ્રાય.",
    },
  };
  response = await expectStatus(
    "create Testimonial",
    await request("/api/admin/content/testimonials", {
      method: "POST",
      body: testimonialDraft,
    }),
    201,
  );
  const testimonial = await jsonItem<{ id: string }>(response);
  created.testimonial = testimonial.id;
  response = await expectStatus(
    "update Testimonial",
    await request(`/api/admin/content/testimonials/${testimonial.id}`, {
      method: "PUT",
      body: { ...testimonialDraft, rating: 4 },
    }),
    200,
  );
  assert.equal((await jsonItem<{ rating: number }>(response)).rating, 4);

  const teamDraft = {
    name: `API Team ${suffix}`,
    role: "Temporary verifier",
    image: "/images/about/team-1.webp",
    gujarati: {
      name: `API ટીમ ${suffix}`,
      role: "અસ્થાયી ચકાસણીકાર",
    },
  };
  response = await expectStatus(
    "create Team member",
    await request("/api/admin/content/team", {
      method: "POST",
      body: teamDraft,
    }),
    201,
  );
  const member = await jsonItem<{ id: string }>(response);
  created.teamMember = member.id;
  response = await expectStatus(
    "update Team member",
    await request(`/api/admin/content/team/${member.id}`, {
      method: "PUT",
      body: { ...teamDraft, role: "Updated temporary verifier" },
    }),
    200,
  );
  assert.equal(
    (await jsonItem<{ role: string }>(response)).role,
    "Updated temporary verifier",
  );

  const catalog = (await (
    await expectStatus(
      "public Catalog reflects created Product",
      await request("/api/content/catalog", {
        authenticated: false,
        trusted: false,
      }),
      200,
    )
  ).json()) as { products: Array<{ id: string }> };
  assert.ok(catalog.products.some((item) => item.id === product.id));

  const blogList = (await (
    await expectStatus(
      "public Blog API reflects created Blog",
      await request("/api/content/blogs", {
        authenticated: false,
        trusted: false,
      }),
      200,
    )
  ).json()) as { items: Array<{ id: string | number }> };
  assert.ok(blogList.items.some((item) => String(item.id) === String(blog.id)));

  const galleryList = (await (
    await expectStatus(
      "public Gallery API reflects created Gallery",
      await request("/api/content/galleries", {
        authenticated: false,
        trusted: false,
      }),
      200,
    )
  ).json()) as { items: Array<{ id: string | number }> };
  assert.ok(
    galleryList.items.some((item) => String(item.id) === String(gallery.id)),
  );
}

async function verifyUpload() {
  const invalidForm = new FormData();
  await expectStatus(
    "upload rejects an invalid purpose",
    await request("/api/admin/content/upload", {
      method: "POST",
      body: invalidForm,
    }),
    400,
  );

  if (!process.env.UPLOADTHING_TOKEN?.trim()) {
    console.log(
      "SKIP successful UploadThing upload (UPLOADTHING_TOKEN is absent)",
    );
    return;
  }

  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  const form = new FormData();
  form.set("purpose", "team-member-image");
  form.append("files", new File([png], "api-smoke.png", { type: "image/png" }));
  const response = await expectStatus(
    "upload a validated image",
    await request("/api/admin/content/upload", {
      method: "POST",
      body: form,
    }),
    201,
  );
  const payload = (await response.json()) as {
    files: Array<{ key?: string }>;
  };
  uploadedKey = payload.files[0]?.key;
  assert.ok(uploadedKey, "Upload response did not include a managed key.");
  await deleteUploadedImages([uploadedKey]);
  uploadedKey = undefined;
  console.log("PASS uploaded image cleanup request");
}

async function verifyEmailAndPasswordResetFlows() {
  await expectStatus(
    "contact form sends through the server email endpoint",
    await request("/api/contact", {
      authenticated: false,
      method: "POST",
      body: {
        name: "GTBS deployment smoke test",
        phone: "9999999999",
        email: adminEmail,
        message: "Automated deployment-readiness email delivery check.",
        website: "",
      },
    }),
    200,
  );

  await expectStatus(
    "password reset rejects an invalid body",
    await request("/api/auth/request-password-reset", {
      authenticated: false,
      method: "POST",
      body: { email: "invalid" },
    }),
    400,
  );
  await expectStatus(
    "password reset preserves account privacy for unknown email",
    await request("/api/auth/request-password-reset", {
      authenticated: false,
      method: "POST",
      body: {
        email: "nobody@example.invalid",
        redirectTo: `${origin}/admin/reset-password`,
      },
    }),
    200,
  );
  await expectStatus(
    "password reset sends the Admin recovery email",
    await request("/api/auth/request-password-reset", {
      authenticated: false,
      method: "POST",
      body: {
        email: adminEmail,
        redirectTo: `${origin}/admin/reset-password`,
      },
    }),
    200,
  );
  await expectStatus(
    "password reset rejects an invalid single-use token",
    await request("/api/auth/reset-password", {
      authenticated: false,
      method: "POST",
      body: {
        token: "invalid-password-reset-token",
        newPassword: "temporary-password-that-will-not-save",
      },
    }),
    400,
  );

  if (process.env.API_SMOKE_EPHEMERAL_ADMIN !== "true") return;
  assert.ok(adminEmail);
  let resetToken = "";
  try {
    const database = getDatabase();
    const [user] = await database
      .select({ id: authUser.id })
      .from(authUser)
      .where(eq(authUser.email, adminEmail))
      .limit(1);
    assert.ok(user, "Ephemeral Admin user was not found.");
    const [verification] = await database
      .select({ identifier: authVerification.identifier })
      .from(authVerification)
      .where(
        and(
          eq(authVerification.value, user.id),
          like(authVerification.identifier, "reset-password:%"),
        ),
      )
      .orderBy(desc(authVerification.createdAt))
      .limit(1);
    resetToken = verification?.identifier.replace("reset-password:", "") || "";
    assert.ok(resetToken, "Password-reset token was not persisted.");
  } finally {
    await closeDatabaseConnection();
  }

  const callback = await expectStatus(
    "password-reset email callback accepts the persisted token",
    await request(
      `/api/auth/reset-password/${resetToken}?callbackURL=${encodeURIComponent(`${origin}/admin/reset-password`)}`,
      { authenticated: false, trusted: false },
    ),
    302,
  );
  const callbackLocation = new URL(
    callback.headers.get("location") || "",
    origin,
  );
  assert.equal(callbackLocation.pathname, "/admin/reset-password");
  assert.equal(callbackLocation.searchParams.get("token"), resetToken);

  const replacementPassword = `Smoke-Reset-${randomUUID()}`;
  await expectStatus(
    "password reset accepts the persisted single-use token",
    await request("/api/auth/reset-password", {
      authenticated: false,
      method: "POST",
      body: { token: resetToken, newPassword: replacementPassword },
    }),
    200,
  );
  await expectStatus(
    "password reset revokes the previous Admin session",
    await request("/api/admin/content/categories", {
      method: "POST",
      body: {},
    }),
    401,
  );
  await signIn(
    replacementPassword,
    "login accepts the database-persisted replacement password",
  );
}

async function deleteRecord(
  key: keyof CreatedRecords,
  pathname: string,
  label: string,
) {
  const id = created[key];
  if (!id) return;
  await expectStatus(
    label,
    await request(`${pathname}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
    [200, 404],
  );
  delete created[key];
}

async function cleanup() {
  await deleteRecord(
    "product",
    "/api/admin/content/products",
    "delete Product",
  );
  await deleteRecord(
    "category",
    "/api/admin/content/categories",
    "delete Category",
  );
  await deleteRecord("blog", "/api/admin/content/blogs", "delete Blog");
  await deleteRecord(
    "gallery",
    "/api/admin/content/galleries",
    "delete Gallery",
  );
  await deleteRecord(
    "testimonial",
    "/api/admin/content/testimonials",
    "delete Testimonial",
  );
  await deleteRecord(
    "teamMember",
    "/api/admin/content/team",
    "delete Team member",
  );
  if (uploadedKey) {
    await deleteUploadedImages([uploadedKey]);
    uploadedKey = undefined;
  }
}

async function main() {
  await verifyPublicReads();
  await login();
  await verifyProtectedEndpointsRejectMissingSession();
  await verifyCrud();
  await verifyUpload();
  await verifyEmailAndPasswordResetFlows();
  await cleanup();
  await expectStatus(
    "logout expires the Admin session",
    await request("/api/auth/sign-out", { method: "POST", body: {} }),
    200,
  );
  console.log("All API endpoint and content CRUD smoke checks passed.");
}

main().catch(async (error: unknown) => {
  console.error(
    `API smoke test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
  );
  await cleanup().catch((cleanupError: unknown) => {
    console.error(
      `API smoke cleanup failed: ${cleanupError instanceof Error ? cleanupError.message : "Unknown cleanup error"}`,
    );
  });
  process.exitCode = 1;
});
