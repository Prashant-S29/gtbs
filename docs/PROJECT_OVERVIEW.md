# Project Overview

## Product

GTBS Book Store is a responsive e-commerce website for Gujarat Tract Book Store. It presents Christian books, Bibles, devotionals, magazines, gifts, store information, editorial content, and a protected administration area.

The repository currently implements a frontend-led storefront with a dynamic Drizzle/PostgreSQL product/category/blog/gallery/testimonial/team repository. Product sales are WhatsApp-assisted: Buy Now sends one Product immediately, while the browser-local Cart collects multiple Products and sends one itemized request. There is intentionally no Wishlist, Checkout, customer-account, payment-capture, or persistent-order page.

## Technology stack

- Next.js 16.3.3 App Router, React 19, and strict TypeScript
- Tailwind CSS 4
- Lucide React
- Resend for server-side Contact and Better Auth password-reset email from `support@gtbsbooks.com`
- Zod for request and persisted-content validation
- Tiptap 3 for the Blog admin rich-text editor
- UploadThing server SDK for managed blog/gallery/product/team images, using canonical `ufsUrl` output and a minimal pnpm patch for its current internal deprecated-getter access
- Drizzle ORM, `pg`, and `dotenv` for runtime PostgreSQL persistence and provider-neutral database setup
- Better Auth with PostgreSQL-backed email/password credentials, sessions, single-use reset tokens, and rate limits
- Azure AI Translator REST APIs for protected Admin English-to-Gujarati translation and Roman-Gujarati transliteration suggestions
- Prettier 3 with an exact project-local version and ESLint compatibility config

## Routes and current state

| Area                     | Routes                                                                                                                                                                                                                            | Current state                                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Storefront               | `/`, `/allproducts`, `/product/[id]`; legacy `/shop` and `/product` redirect to `/allproducts`                                                                                                                                    | Dynamic Product/Category catalog, category-driven homepage Magazines, and homepage Testimonials served by the content repository                           |
| Content                  | `/about`, `/blogs`, `/gallery`, `/gallery/[slug]`, `/contact`                                                                                                                                                                     | Blog, Gallery, and the About Team section are dynamic; Gallery detail URLs use title-derived slugs                                                         |
| Shopping                 | `/cart`                                                                                                                                                                                                                           | Browser-local multi-Product Cart with quantity controls, an acknowledged-on-visit header update badge, and a direct itemized WhatsApp handoff              |
| Removed commerce aliases | `/checkout`, `/wishlist`, `/login`, `/register`, `/profile`                                                                                                                                                                       | No page implementation; old URLs redirect to Cart or All Products                                                                                          |
| Policies                 | Privacy, terms, and shipping routes                                                                                                                                                                                               | Content implemented                                                                                                                                        |
| Admin                    | `/admin/login`, `/admin/reset-password`, `/admin/dashboard`, `/api/auth/[...all]`, `/api/admin/translate/gujarati`, Product, Category, Blog, Gallery, Testimonial, and Team management routes including standalone add/edit pages | Better Auth login/reset; protected shell and content workspaces; editable Azure Gujarati translation/transliteration suggestions; live repository Overview |

All visible storefront catalog links and Product breadcrumbs use `/allproducts`. `/shop` remains only as a permanent backward-compatible redirect that preserves supported category, collection, and search parameters.

The public `SiteChrome` mounts a React-owned language provider backed by separate `src/data/english.json` and `src/data/gujarati.json` dictionaries. Both files use the same section tree for navigation, shared actions/accessibility, Home, Product, Cart, Catalog, Blog, Gallery, Contact, About, FAQ content, errors, legal policies, WhatsApp, and Footer; components keep readable dot-path calls such as `t("home.hero.badge")`. The typed resolver traverses those sections, supports bounded placeholder interpolation, and the selected language is stored in `localStorage`. All storefront-owned visible copy—including About narratives, FAQ answers, Blog/Gallery detail chrome, error screens, and Privacy/Terms/Shipping content—switches through these files. Route metadata remains canonical English. No Google Translate script, hidden selector, translation cookie, page reload, or third-party DOM rewrite is used. Admin routes remain outside this storefront provider and stay English. The persistent Admin header's Storefront action opens the public root in a separate, opener-isolated tab so the current Admin workspace remains available.

The homepage Hero renders its English/Gujarati copy from the storefront dictionary. When the document language is Gujarati, scoped global CSS applies a compact desktop layout with an explicit 8-pixel badge-to-heading gap and a bounded 420-pixel stage so Gujarati font metrics do not create oversized vertical whitespace; mobile height remains content-driven. Because React owns both language variants, switching languages does not mutate nodes behind React's back.

The Header Categories trigger has one route-independent closed style across the storefront. It changes to its orange open state only while the related desktop dropdown or mobile category panel is expanded; catalog route highlighting remains on the relevant navigation link instead of changing the trigger merely because of the current page. Both category menus render the authoritative repository records supplied by the root layout, use authored Gujarati names when available, and show an empty message rather than static fallback categories when Admin has removed every Category.

Public Gallery detail pages show photos in a responsive 1/2/4-column grid. The first 8 are visible initially; View more reveals the remaining batch and expands the photos available to the lightbox. The viewer supports click controls plus Left Arrow, Right Arrow, and Escape keyboard controls.

Gallery cards and canonical detail URLs use each album's stored title-derived slug. Legacy numeric Gallery URLs redirect to the matching slug route when the record still exists.

Public Product, Blog, and Gallery index routes read their initial PostgreSQL repository data in route-level Server Components and pass it into focused interactive Client Components. Their cards and empty states are present in the first server response; hydration does not trigger a second content request. Public repository-backed pages use a 300-second revalidation window, and every successful admin content mutation invalidates the public layout cache. The server-only repository queries Drizzle directly, validates returned JSONB records with Zod, and uses PostgreSQL transactions/advisory locks for coordinated mutations.

The homepage Magazine section has no placeholder Product records. It shows up to three admin-managed Products assigned to the canonical `magazines` Category and links each card to its Product detail page. When that Category has no Products, the section remains visible with the same dashed empty-collection treatment and responsive View All placement used by the other homepage collections. Fresh catalogs seed the Category as `Magazines`; existing catalogs can create that English Category name once and let the backend generate its canonical `magazines` key.

## Data

Products, Categories, Testimonials, and Team members have committed seed arrays in `src/data/`; Blogs and Galleries have no committed fallback records. `pnpm db:setup` applies migrations and initializes PostgreSQL exactly once from those committed seeds. The `gtbs_settings.content_initialized` marker makes later setup runs no-ops so intentionally deleted content stays deleted. All public/Admin reads and all six CRUD modules use the Drizzle repository and authoritative content tables. Better Auth owns PostgreSQL `auth_user`, `auth_account`, `auth_session`, `auth_verification`, and `auth_rate_limit` records; public email abuse counters use `email_rate_limits`, and Azure suggestion request/character counters use `translation_rate_limits`. There is no application runtime filesystem persistence. FAQs remain static bilingual dictionary content keyed by section. Cart uses bounded, validated, non-sensitive `localStorage` records plus a non-sensitive read/unread update marker and intentionally does not synchronize its contents across devices.

## Local setup

1. Install dependencies with `npm install` or the declared package manager, pnpm.
2. Copy `.env.example` to `.env` and provide local values. Never commit `.env`.
3. Set the SSL-enabled `DATABASE_URL` and run `pnpm db:setup`. This applies pending `database/migrations/*.sql` files and initializes the database once from committed seeds.
4. Set `ADMIN_EMAIL`, then run `pnpm admin:setup` once to hash a private interactive password directly into PostgreSQL.
5. Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and the send-scoped `RESEND_API_KEY`. Resend must verify `gtbsbooks.com`; sender identity is fixed to `support@gtbsbooks.com`.
6. Optionally set the server-only `AZURE_TRANSLATOR_KEY` to enable Admin Gujarati suggestions. Leave `AZURE_TRANSLATOR_REGION` unset for a Global resource.
7. Run `pnpm dev` (or `npm run dev`) to use the repository's stable Webpack development fallback on Windows. `pnpm dev:turbopack` remains available for explicit Turbopack diagnostics.
8. Open `http://localhost:3000`.

Useful checks:

```bash
pnpm format:check
npm run lint
npx tsc --noEmit
npm run test:admin-auth
npm run test:content
npm run test:site
# Requires the application to be running; creates and cleans temporary records.
pnpm test:api
npm audit --omit=dev
npm run build
```

## Environment variables

| Variable                   | Purpose                                                                        | Exposure      |
| -------------------------- | ------------------------------------------------------------------------------ | ------------- |
| `NEXT_PUBLIC_SITE_URL`     | Canonical HTTPS origin and SEO                                                 | Public        |
| `BETTER_AUTH_URL`          | Better Auth canonical HTTPS origin; must match the deployed site               | Server config |
| `BETTER_AUTH_SECRET`       | Stable Better Auth signing/encryption secret, minimum 32 characters            | Server secret |
| `GOOGLE_SITE_VERIFICATION` | Search Console verification                                                    | Server config |
| `RESEND_API_KEY`           | Send-scoped Resend key for Contact and Admin password recovery                 | Server secret |
| `CONTACT_RECIPIENT_EMAIL`  | Optional Contact destination; defaults to `support@gtbsbooks.com`              | Server config |
| `DATABASE_URL`             | PostgreSQL runtime/setup connection; use Supabase transaction pooler on Vercel | Server secret |
| `DATABASE_POOL_MAX`        | Per-instance PostgreSQL pool cap; production default/recommendation is `2`     | Server config |
| `API_SMOKE_BASE_URL`       | Optional target origin for the live API smoke suite                            | Server config |
| `API_SMOKE_ADMIN_PASSWORD` | Local controlled smoke credential; never configure in production               | Test secret   |
| `UPLOADTHING_TOKEN`        | Authenticates server-side blog/gallery/product/team image uploads              | Server secret |
| `ADMIN_EMAIL`              | The only Better Auth identity authorized for Admin routes                      | Server config |
| `AZURE_TRANSLATOR_KEY`     | Enables protected Admin Gujarati translation/transliteration suggestions       | Server secret |
| `AZURE_TRANSLATOR_REGION`  | Optional Azure resource region; omit for a Global Translator resource          | Server config |

## Current limitations

- Gujarati suggestion assistance depends on Azure Translator configuration and availability. Without credentials it reports a controlled unavailable state while every Gujarati input remains manually editable. Suggestions do not save automatically. Blog Article translation intentionally converts extracted plain paragraphs into editable paragraph nodes, so headings, lists, links, and other English rich-text formatting must be reviewed/recreated in the Gujarati editor.
- Overview has no order, revenue, customer, or analytics metrics because those domains are not implemented. It reports only Product, Category, Blog, Gallery, Testimonial, and Team data available from the authoritative content repository.
- Admin Orders, Customers, Analytics, Settings, and Help are not implemented and are not shown in the sidebar; Overview, Products, Categories, Blogs, Gallery, Testimonials, and Team are available.
- The authenticated Admin sidebar/top bar is owned by the persistent `/admin` layout, so Next.js client navigation and loading states replace only the main content panel. Active styling is derived from the pathname and remains correct on list, add, and edit routes. `/admin/login` and `/admin/reset-password` intentionally omit this panel chrome; visibility is not an authorization boundary.
- Product management supports search/filter/list and standalone add/edit forms for books, gifts, accessories, and other catalog items. The Admin list shows Product, Category, Price, and Actions without exposing legacy stock or route identifiers. The form starts on English content and shows `Next`; successful English/shared-field validation advances to Gujarati without uploading or saving. The Gujarati step provides `Previous` and performs the final create/update submission. Both steps preserve their unsaved title, specifications, variants, short description, overview, and features. New writes require both titles, while Price, Category, Badge, Card image, and up to 6 Detail page images are shared. The Product ID/slug is generated by the backend from the English title on create and retained on edit. Each language supports up to 50 specification values, 20 product-specific variant groups with up to 50 individual option inputs per group, and 30 individual feature inputs. Specification and Variant cards share the same grouped design: a full-width name input, a divided Values/Options area, an add button, and individually removable two-column inputs. Existing repeated specification names are grouped in the editor and flattened back into the established `{ name, value }` records when submitted. Features use individual inputs with adjacent add/delete icons; plus inserts a field immediately after the selected feature. Partially completed specification or variant groups are reported before advancing or saving, while wholly blank groups/feature inputs are omitted. Exact duplicate features and variant options are collapsed independently on submission, while legacy duplicates remain safe to render. Brand/creator, inventory/availability, and rating/review-count controls are not authored in this form. The storefront reactively selects authored Gujarati Product cards, catalog-search titles, detail breadcrumbs/content, variants, specifications, and related items; legacy Products without Gujarati content fall back to their stored English text. Category remains shared by slug, while its display name is bilingual. The storefront renders saved groups such as Size, Color, Format, Pack, Storage, or Edition without hardcoded variant names, and the detail gallery combines the card image with saved extras in a horizontally scrollable row of 80-pixel square thumbnails below a compact square main-image stage. Legacy creator, book, inventory/rating, and extra-image URL fields remain readable by the storage validator, with book details and legacy images migrated into generic records when edited, but new mutations use only the flexible supported shape. Category selection is strict, but an admin can open Add category from the Product form, enter English then Gujarati names in a two-step modal, submit only from Gujarati, and have the backend-generated key selected immediately. The separate Category manager uses the same English `Next`, Gujarati `Previous`/final-submit flow, retains the stored key on edit, and prevents deletion of an assigned Category. Category rows show both authored names; homepage Category cards and All Products filters select saved Gujarati names reactively. Category slugs/descriptions are not authored or displayed in Admin CRUD, while stored legacy values remain available for routing, relations, and backward-compatible validation.
- Product Core details stacks on mobile; from `sm` upward Category spans the shared row and Badge pairs with Price while the current step's Title remains full-width.
- Category final-step actions stack full-width on narrow screens; from `sm` upward Previous stays compact and Create/Update fills the remaining row without wrapping its label.
- Product detail variant choices use compact chips. The purchase row uses a compact quantity stepper and content-bounded Add to Cart/Buy Now actions on larger screens; on mobile the two CTAs share one balanced two-column row rather than stretching into oversized desktop columns.
- Blog and Gallery index routes default to responsive tables with text search, category filtering, and 8-row client-side pagination. Add and Edit navigate to separate protected form routes; Save or Cancel returns to the related list, while View opens the corresponding public detail route. CRUD mutations report success/failure through admin-scoped toasts, and Delete requires confirmation in a custom modal.
- Blog admin create/edit pages use the sequential English-to-Gujarati flow. The English step validates shared Date, Banner image, Author avatar, title, category, author, and article content before `Next` reveals the Gujarati card. The Gujarati step can return with `Previous` and is the only step that submits the bilingual payload. Both language articles use the responsive Tiptap toolbar for headings, inline emphasis, lists, quotes, code, rules, links, and history controls. The backend derives a unique slug from the English title on create and retains it on edit. When Gujarati is selected on the storefront, saved Gujarati data is used reactively on home cards, the Blog list/search/categories, detail content, breadcrumbs, and related articles; legacy posts without it retain their stored English content. The forms no longer require a summary field, and the author avatar is optional. If no avatar image is uploaded, the form uses `/images/logo/logo.webp` so the public author card still renders a valid image.
- Gallery admin create/edit pages use the same English `Next` then Gujarati final-submit flow while preserving both sets of unsaved values. Date and the Gallery images card remain shared. Each language requires title, category, location, and description while organizer is optional. Subtitle and Slug are not authored through Gallery CRUD; the backend derives a unique slug from the English title on create and retains it on edit. Cover upload, extra-photo selection, inline image errors, retained photos, and pending previews stay together in the image card. Selecting Gujarati reactively switches authored Gallery list/search/category, detail, breadcrumb, organizer, and related-album text; legacy records without Gujarati content retain their stored English content.
- Testimonial management provides a searchable, paginated list plus protected standalone add/edit forms and confirmation-based deletion. Rating is a shared 1–5 value; English and Gujarati separately require customer name, role, and testimonial text. Add/Edit starts with English `Next`, preserves the draft when Gujarati is shown, and submits only from the Gujarati step; `Previous` returns to English. The homepage review carousel reads the repository on each dynamic request, renders saved star ratings, switches reactively to authored Gujarati content, and disappears when the persisted list is empty. Initials are derived from the localized customer name; avatar uploads and manual ordering are not implemented.
- Team management provides a searchable, eight-row paginated list plus protected standalone add/edit forms and confirmation-based deletion. Each profile has one shared uploaded image and separately required English/Gujarati name and role fields. Add/Edit starts on English, advances with `Next`, and creates/updates only after Gujarati validation; `Previous` preserves and restores the English draft. The dynamic About page selects authored Gujarati profiles reactively and hides the complete Team section when its persisted array is empty. Repository order controls display order; manual reordering is not implemented.
- Image selection errors are displayed directly below the affected banner, cover, or extra-photo input; general API/mutation failures remain form-level and toast notifications.
- Newly selected Gallery extra photos render local previews before submission, are marked `New`, can be removed individually, and remain subject to the combined 12-photo limit.
- Product/category/blog/gallery/testimonial/team persistence requires reachable PostgreSQL and a server-only `DATABASE_URL`. The Drizzle repository supports shared runtime content across read-only/serverless application instances, subject to the deployment's connection-pooling limits.
- Uploading images and then failing a later content mutation can leave an unreferenced UploadThing file that must be cleaned up manually.
- Admin auth intentionally authorizes one configured Better Auth identity and no roles. Credentials, sessions, reset tokens, session revocation, and auth throttling are PostgreSQL-backed and safe across Vercel instances.
- Cart is device-local browser state; it is not authenticated, inventory-reserved, server-validated, or synchronized across devices.
- Buy Now and Cart prepare WhatsApp enquiries only. They do not confirm shipping, reserve stock, charge a payment method, or create a persistent order.
- Wishlist, Checkout, customer sign-in, registration, and profile pages are intentionally absent from the product scope.
- Contact delivery depends on Resend availability/quota. Requests are same-origin validated, bounded, honeypot screened, and PostgreSQL rate-limited; provider monitoring remains operational work. Vercel DNS contains Resend sending records and Google Workspace MX/SPF for `support@gtbsbooks.com`; actual inbox delivery still depends on the Workspace account and DNS propagation.
- Vercel deploys `main` to the production environment/domain and `staging` to its stable preview domain; repository configuration disables automatic deployments from all other branches.
- Every Vercel Preview build is search-excluded through page metadata, a site-wide `X-Robots-Tag`, no Google verification tag, and a disallow-all `robots.txt`. Production remains indexable. These controls instruct compliant crawlers; access protection remains the stronger option for confidential future staging content.
- Each Vercel environment needs matching HTTPS `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` values for its assigned domain; otherwise metadata is incorrect and production Admin auth fails closed.
- Windows sandbox child-process restrictions can block build/test workers; use the documented direct in-process test fallback for diagnosis and require an exit-0 production build before release.
