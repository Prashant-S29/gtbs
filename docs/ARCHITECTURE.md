# Architecture

## High-level structure

```text
Browser
  ├─ Public App Router pages
  │    ├─ shared site chrome
  │    ├─ feature components
  │    └─ server-only Drizzle product/category/blog/gallery/testimonial/team repository
  ├─ Contact form → POST /api/contact → Resend
  └─ Admin pages
       ├─ Better Auth email/password → /api/auth/[...all]
       ├─ Resend password-reset link → PostgreSQL token → replacement password
       ├─ PostgreSQL session + secure HttpOnly cookie
       ├─ protected dashboard/content workspaces
       └─ CRUD/upload APIs → PostgreSQL + UploadThing
```

## Directory responsibilities

| Path                     | Responsibility                                                                 |
| ------------------------ | ------------------------------------------------------------------------------ |
| `src/app/`               | Routes, layouts, metadata, pages, and route handlers                           |
| `src/components/`        | Reusable UI organized by feature                                               |
| `src/contexts/`          | Cross-tree client providers                                                    |
| `src/data/`              | Typed one-time database seeds and remaining static content                     |
| `src/db/`                | Drizzle PostgreSQL schema and pooled server-only client                        |
| `src/lib/`               | Utilities, SEO, constants, auth, and the shared content repository             |
| `src/types/`             | Shared domain types                                                            |
| `public/images/`         | Static image assets                                                            |
| `database/migrations/`   | Ordered, immutable PostgreSQL content/auth/email-control schema migrations     |
| `scripts/setup-db.mjs`   | Provider-neutral migration runner using the server-only `DATABASE_URL`         |
| `scripts/seed-db.ts`     | One-time validated committed-content initializer                               |
| `scripts/setup-admin.ts` | Interactive one-time Better Auth credential bootstrap directly into PostgreSQL |
| `docs/`                  | Maintained project knowledge                                                   |

## Rendering boundaries

- Pages are Server Components by default.
- Use `"use client"` only for state, effects, events, storage, or client navigation.
- The root layout loads metadata, structured data, and `SiteChrome`; system font stacks avoid a build-time/runtime dependency on remote Google font files. The root `<body>` suppresses attribute-only hydration warnings because browser writing assistants such as Grammarly inject `data-*` attributes before React hydrates; application-owned descendants remain subject to normal hydration diagnostics.
- `SiteChrome` removes public header/footer controls for `/admin` routes and mounts `LanguageProvider` only around the public branch.
- The language provider owns the English/Gujarati selection, persists it in `localStorage`, and resolves typed dot paths through matching nested sections in the separate checked-in `english.json` and `gujarati.json` dictionaries. The resolver imports both dictionaries, walks the selected section object, falls back to the English leaf if necessary, and interpolates named placeholders without injecting markup. Storefront chrome, page copy, accessible labels, FAQ bodies, error messages, and policy bodies all use this path. FAQ data stores translation keys rather than rendered language strings; `Faq` resolves them inside the provider. Server policy routes retain static metadata and delegate visible content to the shared `LegalPolicyPage` client boundary. The system does not inject third-party scripts or mutate translated DOM nodes.
- The homepage Hero is a small client boundary that resolves its copy through `t(key)`. Gujarati presentation is selected by scoped `html[lang="gu"]` rules in global CSS, using an explicit badge/heading flex gap and bounded desktop stage while React remains the only owner of the text nodes.
- Local `pnpm dev` uses Next.js Webpack mode to avoid the observed native Windows Turbopack cache-memory crash. `experimental.webpackMemoryOptimizations` reduces peak Webpack usage and `preloadEntriesOnStart: false` avoids front-loading every route module on a memory-constrained workstation. Production builds retain the default bundler; `pnpm dev:turbopack` is an explicit diagnostic command rather than the stable local path. `agentRules: false` prevents Next dev from rewriting the repository-owned `AGENTS.md`; project instructions remain maintained manually.

## Storefront data flow

Product and Category records flow through `contentRepository.ts`, which executes every read and mutation through the pooled server-only Drizzle PostgreSQL client. The home catalog sections and Category cards read it in Server Components; `/allproducts` also reads its query and repository data in a route-level Server Component and passes the initial arrays to a focused interactive filter component. Product detail metadata/rendering and sitemap resolve the same database records. Product IDs are normalized slugs generated by the repository from the English title and form dynamic routes. Public repository-backed pages use a 300-second revalidation interval, while successful admin content mutations call the shared storefront revalidation helper to invalidate the public layout cache.

The root layout also reads the authoritative Category array and serializes it through `SiteChrome` into the interactive Header. Desktop and mobile menus derive their names and query links from those records and render an explicit empty state for an intentionally empty catalog; no Header-specific seed or curated fallback list exists. The existing public-layout invalidation after Admin mutations refreshes this shared navigation data.

Catalog, blog, gallery, and testimonial filter/search handlers reset pagination within the same user event, avoiding state-mirroring effects. Home Product and Testimonial carousels use native horizontal overflow plus CSS scroll snap and button-driven `scrollBy`, avoiding a dedicated carousel runtime and autoplay work.

`storefrontStorage.ts` owns browser-local Cart records. It validates and bounds data on every read, exposes React snapshots with `useSyncExternalStore`, notifies same-tab consumers with custom events, and listens for browser `storage` events across tabs. A separate non-sensitive marker records whether an Add to Cart update has been reviewed: successful additions mark the header badge unread, and opening `/cart` acknowledges it without changing the Cart. Cart lines include only Product display data, selected variants, price, and bounded quantity; no secrets or payment data are stored. `whatsappOrder.ts` is the single message builder used by Product-card Buy Now, Product-detail Buy Now, and the multi-Product Cart. Messages contain a greeting, Product title/link, quantity, price, optional variant details, and an aggregate total when applicable. The receiving business must still confirm availability, shipping, and payment, and no order is persisted server-side.

## Catalog and editorial content flow

1. `pnpm db:setup` applies schema migrations and then performs one initialization transaction from `src/data/products.ts`, `src/data/categories.ts`, `src/data/testimonials.ts`, and `src/data/team.ts`; Blogs/Galleries start empty. The `gtbs_settings.content_initialized` marker prevents reruns from restoring intentionally deleted records. No JSON file is imported or used for persistence.
2. Product create/update verifies that the referenced Category exists inside the serialized mutation. The Product form may first open an Add category modal and create a missing Category by name through the normal Category POST endpoint, then inserts and selects the returned record locally. This Category mutation is independent, so cancelling the Product does not roll it back. Category keys are generated on create and retained on rename, so assigned Product relations remain stable; delete refuses a Category that still owns Products.
3. Product and Category route handlers apply admin authorization, origin/marker verification, a 64 KiB request limit, and strict Zod validation. Product drafts accept one Price, an optional allow-listed collection Badge, up to 50 generic specification name/value pairs, and up to 20 named variant groups containing at most 50 bounded options each. Original price, arbitrary badge text, creator text, fixed Format/book fields, and inventory/rating properties are legacy-at-rest fields rejected on new mutations. The repository parses again at the persistence boundary and serializes related cross-instance mutations with PostgreSQL transactions and advisory locks.
4. Product card and detail images use the shared server-mediated upload path. One card image and up to 6 extra detail images receive managed provider keys; the Product form previews/removes pending and retained extras, and update/delete compares retained keys before best-effort UploadThing cleanup. Legacy `images` URL arrays validate only at rest, are merged into the public detail gallery, and become keyless detail-image records on the next Product save. The public detail gallery uses a compact square main-image stage with `object-contain`, then renders every deduplicated image as an 80-pixel square thumbnail in one horizontally scrollable strip directly below it at all breakpoints.
5. Home New Releases, Best Sellers, Trending, and Accessories sections derive membership from the controlled Product Badge, while legacy matching remains supported and Accessories also includes the accessories Category. The home page composes the shared interactive carousel directly for all four collections instead of routing props through one-use wrapper components. The same Accessories collection rule is used by the all-products filter and its View All link; empty collections render an explicit empty state rather than former placeholder Products. The separate Magazine section uses only Products whose Category slug is exactly `magazines` and renders at most three; when empty it retains its heading, responsive View All action, and dashed empty-collection panel rather than returning no section or static fallback cards.
6. Product detail pages prefer generic specifications and variant groups. When only legacy book data exists, the admin and storefront derive display-only specification rows and one Format variant group; the next successful edit persists only the flexible fields. Detail structured data emits schema.org `Product` without forcing Book or creator/Brand attributes. Selected variants and quantities can be added to the browser-local Cart, but they are not inventory-validated or persisted as an order.

The editorial flow shares the same database repository:

1. Blogs and Galleries have no committed seed modules and initialize as empty tables.
2. `contentRepository.ts` queries JSONB records through Drizzle and validates every result with the complete Zod store schema before returning it. There is no filesystem fallback or process-local content cache.
3. Admin create/update/delete requests require the validated Better Auth database session, matching Origin/fetch metadata, and `X-GTBS-Admin-Request: 1`.
4. Each mutation uses a PostgreSQL transaction. Transaction-scoped advisory locks coordinate slug generation, prepend/append ordering, and Product/Category relationship decisions across application replicas; database constraints provide the final identity and foreign-key enforcement.
5. Public list APIs remain no-store for direct consumers, but Product, Blog, and Gallery index pages do not fetch them after hydration. Route-level Server Components read the repository and pass initial data into their interactive Client Components, eliminating the extra browser request and loading waterfall. Detail pages, the home blog section, and sitemap also read through the repository. Public pages revalidate after 300 seconds, and successful protected mutations invalidate the public layout cache on demand.
6. Images upload through the server-only UploadThing SDK. The browser never receives `UPLOADTHING_TOKEN`. Application mapping consumes only `ufsUrl`; because latest stable `uploadthing@7.7.4` internally reads its own deprecated URL getters, a minimal pnpm patch maps its compatibility fields from `ufsUrl` in both distributed server module formats.
7. Managed UploadThing keys are stored beside URLs. Replaced or deleted managed images are deleted best-effort from UploadThing; legacy/local/external seed images have no managed key and are never deleted remotely.
8. Blog Article content is edited as Tiptap JSON. Draft validation bounds the JSON and allow-lists its nodes, marks, attribute primitives, and link protocols. The repository also derives plain-text sections for summaries and backward compatibility. Public detail pages render the validated tree through explicit React element mappings; legacy records without `richContent` continue through the section renderer.
9. Blog mutations include required English and Gujarati authored text with one shared date, banner, and avatar. The repository generates the slug from the English title during create and keeps it unchanged during update; it derives each language summary and compatibility sections independently. The stored Gujarati block remains optional at rest so pre-feature records continue to load. Blog create/update JSON is capped at 256 KiB for the two bounded rich-text documents; other content JSON retains the 128 KiB default.
10. Storefront Blog client boundaries read `LanguageContext`, resolve shared UI keys from the JSON dictionary, and select the stored Gujarati block reactively for cards, filters/search, detail content, breadcrumbs, and related articles. Legacy posts without the block display their stored English content.
11. Gallery mutations keep date, cover, and photos shared while requiring separate English and Gujarati title, category, location, description, and optional organizer values. The repository generates a unique slug from the English title on create and retains it on update. Slug and Subtitle are omitted from mutation drafts; legacy stored Subtitle data continues to validate.
12. Storefront Gallery client boundaries resolve shared UI keys from the JSON dictionary and select the stored Gujarati block reactively for filters/search, album cards, detail text, breadcrumbs, organizer credit, and related albums. Legacy albums without the block display stored English content.
13. Product mutations require English and Gujarati authored titles and accept independently bounded specifications, variants, descriptions, overviews, and feature lists. The Admin Product client groups specification records by name into `{ name, values[] }` editing drafts so Specifications can share the same nested card UI as Variants. Submission flattens each nonblank value back into the established `{ name, value }` API records, preserving persisted and storefront compatibility. English and Gujarati feature arrays are controlled independently as individual inputs and normalized directly into the existing bounded string arrays. The client performs incomplete-group checks before a language transition or final save, then trims blank entries and duplicate variant options/features into the typed payload. Category relation, badge, price, and media remain shared. The repository generates the Product ID/slug from the English title on create and retains it on update. The persisted Gujarati block is optional so existing seeds and legacy storage remain valid.
14. Storefront Product client boundaries read `LanguageContext`, resolve shared catalog/cart/detail controls through `t(key, params)`, and select saved Gujarati content for cards, catalog title search, detail breadcrumbs, purchase information, variants, overview/features, specifications, and related cards. Legacy Products without Gujarati fields display stored English content.
15. Testimonials receive committed bilingual records only during first database initialization when no legacy Testimonial array exists. The admin list/add/edit/delete routes read and mutate the shared PostgreSQL table through protected APIs. New drafts require bounded English and Gujarati name, role, and review text plus a shared integer 1–5 rating; stored Gujarati remains optional for backward-compatible records.
16. The homepage reads Testimonials, Products, and Categories together in its Server Component and passes them into focused client boundaries. The Testimonial boundary resolves its static labels from the dictionary, selects authored Gujarati text from `LanguageContext`, renders the saved star count in the native scroll-snap carousel, and returns no section for an intentionally empty persisted array.
17. Team members receive four committed bilingual records only during first database initialization when no legacy Team array exists. Protected admin list/add/edit/delete routes mutate the shared PostgreSQL table through Drizzle transactions. New drafts require bounded English and Gujarati name/role blocks plus one shared image; stored Gujarati remains optional so older records continue to validate.
18. The dynamic About Server Component reads Team members and passes them to the existing client grid. That boundary reacts to `LanguageContext`, resolves its heading/description from the dictionary, selects authored Gujarati name/role text, preserves the shared image and identifier, and returns no Team section for an intentionally empty persisted array.

On the public Gallery detail route, `GalleryLightbox` progressively exposes photos in batches of 8. The responsive grid uses 1 column on mobile, 2 on tablet, and 4 on desktop. Click and Left/Right keyboard navigation are bounded to the currently visible slice so undisclosed photos do not open before View more is selected; Escape closes the viewer. The document keyboard listener exists only while the lightbox is open and is removed on close/unmount.

Gallery detail links, canonical metadata, structured data, and sitemap entries use the stored slug. `getGallery` continues to resolve either an ID or slug, allowing an incoming numeric URL to find the record and redirect to the canonical `/gallery/[slug]` address.

The `/admin` route layout owns `AdminPanelShell`, a pathname-aware Client Component that persists the desktop sidebar, top header, horizontally scrollable mobile route bar, and Storefront/Logout controls across protected page transitions. It bypasses panel chrome on unauthenticated `/admin/login` and `/admin/reset-password`; that visual decision is not authorization. `AdminContentShell` is now a page-local Server Component responsible only for the current heading, description, and content. Consequently the Admin loading boundary replaces content inside the stable main panel rather than replacing the complete screen. Overview is a force-dynamic protected Server Component: after session verification it loads Product, Category, Blog, Gallery, Testimonial, and Team arrays concurrently through `contentRepository.ts`, then derives totals, Category/Product distribution, Gallery photo count, Testimonial average rating, Team role count, and one current snapshot per module. It does not fabricate commerce analytics for the unimplemented order/revenue domains. Product, Blog, Gallery, Testimonial, and Team index routes use list-first tables and protected standalone add/edit pages. Their bilingual forms reuse `AdminBilingualFormSteps`: English is always step 1, `Next` performs client validation and changes only local UI state, and Gujarati is step 2 with `Previous` plus the only final submit action. Both language sections stay mounted while only the current section is displayed, preserving unsaved values without moving shared fields or media. Categories retain their inline CRUD workspace beside the list but now use the same mounted English-to-Gujarati step state; the Product form's inline Category modal mirrors that contract. Category mutations require both names, while the persisted Gujarati block remains optional for seeds and legacy records. A focused localization helper selects authored Gujarati names for homepage cards and catalog filters without changing the shared slug relation. Category draft validation rejects description and slug input; stored legacy description and the required route key remain readable but are not authored/displayed. The admin layout also owns a persistent Sonner toaster; destructive actions use the shared confirmation modal, and the protected API remains the source of persistence.

Admin UI components are grouped by domain beneath `src/components/admin/`: Product, Category, Blog, Gallery, Testimonial, Team, and login controls live in their matching feature folders. Cross-domain components such as the persistent `AdminPanelShell`, page-local `AdminContentShell`, `AdminBilingualFormSteps`, and `ConfirmDeleteModal` remain at the admin root. Route modules import these components through the `@/components/admin/...` alias, so folder organization does not affect the public or protected route structure.

Image controls keep field-specific client validation state: Product card/detail images, Blog banner, Gallery cover/extra photos, and Team member images each render their own validation message adjacent to the input. Product and Gallery multi-image selections show removable local previews and revoke their temporary object URLs on removal/unmount. Cross-field, upload-provider, and API mutation failures remain general form errors and toasts.

The Blog editors are focused Client Components inside the existing admin form. English and Gujarati each have independent Tiptap state, disable immediate server rendering to avoid Next.js hydration mismatches, report JSON changes to the form, and wrap their 40-pixel toolbar controls on narrow screens. The English article is checked for non-empty, bounded content before advancing; final Gujarati submission rechecks English and validates Gujarati before uploading images or calling the mutation API.

Gallery extra-photo selections are stored as pending `File` objects plus browser object URLs. The form appends valid selection rounds, renders pending thumbnails beside retained provider images, and revokes every temporary URL when removed or unmounted. Submission sends only the underlying files to the existing upload client; a local preview does not imply that UploadThing has completed.

Because those pending thumbnails use browser `blob:` URLs, the admin-only CSP permits `blob:` in `img-src`. No other CSP directive accepts blob resources.

The repository remains the typed boundary used by every public page, protected page, and content API. Its Drizzle implementation uses database transactions and transaction-scoped advisory locks for cross-instance slug generation, ordering changes, and Category/Product relationship checks.

## PostgreSQL provisioning boundary

`pnpm db:setup` is a provider-neutral Node/`pg` migration runner; it does not use a Supabase-specific CLI or SDK. It loads the server-only `DATABASE_URL`, opens one PostgreSQL transaction, takes a transaction-scoped advisory lock, creates `gtbs_schema_migrations` when needed, verifies the SHA-256 checksum of every previously applied migration, and applies pending ordered SQL files from `database/migrations/`. A failure rolls back the complete pending batch, and rerunning an up-to-date checkout performs no schema changes. Applied migration files are immutable; schema evolution requires a new numbered file.

The initial schema provides one table per active content domain plus `gtbs_settings`. Each content table stores the complete application record as validated JSONB, promotes IDs/slugs/category relations/order to constrained columns, and adds timestamps and query indexes. Product category deletion is restricted by a foreign key. Row-level security is enabled without browser-role policies because the schema is intended for server-owned access; no connection URL is exposed to the browser.

The same schema is the authoritative runtime persistence boundary. `contentRepository.ts` maps each validated domain object to JSONB while promoting IDs, slugs, Category relations, and display positions into constrained/indexed columns. Better Auth stores users, credential accounts, sessions, reset verifications, and rate limits in dedicated RLS-enabled PostgreSQL tables. Public Contact abuse counters use a separate RLS-enabled table. No runtime state depends on writable application files or process memory.

`pnpm test:api` is the live HTTP integration boundary. With the application running, it exercises all 25 exported methods across 18 API route files: public content reads; Better Auth login/logout/password reset; server-side Contact/Resend delivery; upload authorization/validation/provider success; and authenticated create/update/delete for all six content domains. The controlled ephemeral-admin mode also consumes a real persisted reset token, verifies old-session revocation, signs in with the replacement database password, and cleans the temporary identity, verification, rate-limit, content, and UploadThing records.

## Admin authentication

1. Better Auth is mounted at `/api/auth/[...all]`; its client handles email/password sign-in, sign-out, reset-link requests, and final password replacement.
2. Public signup is disabled. `pnpm admin:setup` is the only bootstrap path: it takes a hidden interactive 12–128 character password, hashes it with Better Auth's password utility, and transactionally inserts only the configured `ADMIN_EMAIL` and credential account into PostgreSQL.
3. Every protected Server Component and mutation retrieves the current Better Auth session from request headers, verifies the database session, and confirms that its normalized email equals `ADMIN_EMAIL`. A manually created non-Admin Better Auth user cannot authorize content operations.
4. Better Auth applies origin checks and generic credential/reset responses. Auth endpoint limits are persisted in `auth_rate_limit`, not process memory; the sign-in and reset paths have stricter custom 15-minute rules.
5. Forgot password requests create a random, one-hour, single-use verification in `auth_verification`. Resend sends the Better Auth callback URL from `support@gtbsbooks.com`; the callback validates the token and redirects to `/admin/reset-password` with only the valid continuation token.
6. Successful password replacement hashes the new password in `auth_account`, consumes the verification, and revokes all existing database sessions. Passwords are never stored in files, environment variables, logs, URLs, or browser storage.
7. Sessions last up to seven days and are refreshed after one day. The browser holds only Better Auth's Secure/HttpOnly production cookie; cookie caching is disabled so authorization always checks PostgreSQL.
8. Production Admin authorization fails closed unless `ADMIN_EMAIL`, `DATABASE_URL`, a stable 32+ character `BETTER_AUTH_SECRET`, and matching HTTPS `BETTER_AUTH_URL`/`NEXT_PUBLIC_SITE_URL` are configured. Missing Resend configuration affects delivery but never bypasses or disables credential/session verification.

Vercel/Supabase deployments use the transaction pooler and a small per-instance pool (`DATABASE_POOL_MAX=2`). Better Auth and Contact limits are database-backed; Vercel Firewall limits can remain an additional defense layer rather than a correctness requirement.

## Deployment environments

- `vercel.json` enables Git-triggered builds only for `main` and `staging`; the Vercel project production branch is `main`.
- `gtbsbooks.com` aliases Production deployments. `staging.gtbsbooks.com` is a branch domain that follows Preview deployments from `staging`.
- Preview builds are identified from Vercel's system-owned `VERCEL_ENV=preview`. They emit disallow-all robots policy, noindex/nofollow/noarchive/nosnippet/noimageindex metadata, and the equivalent `X-Robots-Tag` on every route response. Google site verification is omitted.
- Production and Preview have separately scoped canonical/Auth URL values. Preview markup can retain canonical production URLs as an additional duplicate-content signal, but canonical tags never replace noindex controls.
- GoDaddy remains the registrar while Vercel nameservers are authoritative for DNS. The zone carries Vercel's project aliases plus Resend DKIM/SPF-return-path/DMARC sending records. Incoming support mail is a separate boundary and requires mailbox-provider MX records.

## Decisions

### ADR-001: Next.js App Router

- **Status:** Accepted
- **Reason:** Server rendering, route handlers, metadata, and nested layouts in one app.

### ADR-002: Typed seeds for first database initialization

- **Status:** Superseded for runtime reads; retained for one-time seeds
- **Reason:** A new database needs baseline Product/Category/Testimonial/Team content.
- **Consequence:** `pnpm db:setup` inserts the committed records once and marks initialization; PostgreSQL remains authoritative afterward, including intentional empty tables. Analytics and orders remain non-persistent; Cart data exists only in the visitor's browser.

### ADR-003: Environment-backed single admin

- **Status:** Superseded by ADR-011
- **Reason:** It protected the initial Admin area before database-backed identity was implemented.
- **Consequence:** Environment password/hash, custom session, TOTP, process-local throttles, and filesystem credential override code have been removed.

### ADR-004: Documentation in definition of done

- **Status:** Accepted
- **Reason:** Behavior and decisions must remain discoverable.
- **Consequence:** Every change updates progress and affected topic documents.

### ADR-005: Fail-closed production admin configuration

- **Status:** Accepted and revised by ADR-011
- **Reason:** Plaintext deployment passwords, short signing secrets, incorrect origins, and insecure cookies are not acceptable for the administration boundary.
- **Consequence:** Deployments configure stable Better Auth/origin secrets and bootstrap the one PostgreSQL Admin account interactively; no password environment variable is accepted.

### ADR-006: File-backed catalog and content repository

- **Status:** Superseded by ADR-010
- **Reason:** It initially delivered dynamic Product/Category/Blog/Gallery/Testimonial/Team CRUD before a database platform was selected.
- **Consequence:** All legacy JSON import/storage code and files have been removed; committed typed seeds are the only fresh-database initializer.

### ADR-007: Server-mediated UploadThing images

- **Status:** Accepted
- **Reason:** Keeps the provider token server-only and centralizes authentication, type, signature, count, and size enforcement.
- **Consequence:** Blog banners, Gallery covers/photos, Product images, and Team member images accept only JPG, PNG, or WebP files up to 500 KiB each; Gallery extra photos are capped at 12 and Product detail images at 6.

### ADR-008: Server-mediated email-OTP password recovery

- **Status:** Superseded by ADR-011
- **Reason:** The former custom OTP flow predated database-backed identity.
- **Consequence:** EmailJS, custom OTPs, process-local recovery state, and filesystem credential persistence have been removed.

### ADR-009: Provider-neutral PostgreSQL migrations

- **Status:** Accepted
- **Reason:** A PostgreSQL/Supabase database must be reproducibly provisioned without requiring a provider-specific CLI.
- **Consequence:** `pnpm db:setup` applies checksum-tracked SQL through `DATABASE_URL` and then runs idempotent one-time content initialization.

### ADR-010: Drizzle PostgreSQL content repository

- **Status:** Accepted
- **Reason:** Public and Admin content must share durable persistence across restarts and application replicas while retaining strict existing domain validation.
- **Consequence:** Every content read and CRUD mutation uses the server-only Drizzle/`pg` repository. Deployment requires `DATABASE_URL` and initialized tables; no legacy JSON persistence exists.

### ADR-011: Better Auth and Resend on shared PostgreSQL

- **Status:** Accepted
- **Reason:** Admin identity, sessions, password recovery, and abuse controls must work across ephemeral Vercel instances without filesystem or process-local correctness dependencies.
- **Consequence:** Better Auth owns PostgreSQL identity/session/verification/rate-limit tables; only `ADMIN_EMAIL` is authorized, signup is disabled, reset completion revokes all sessions, and Resend delivers fixed-domain server-side mail from `support@gtbsbooks.com`. Contact requests use bounded validation, honeypot screening, same-origin checks, and PostgreSQL throttling.

### ADR-012: Two-branch Vercel release topology

- **Status:** Accepted
- **Reason:** Production and stable pre-production need predictable branch/domain ownership without spending provider builds on arbitrary branches or exposing staging to search.
- **Consequence:** only `main` and `staging` trigger Git deployments; their domains and environment-scoped origins remain distinct, and every Preview build carries layered search-exclusion directives.
