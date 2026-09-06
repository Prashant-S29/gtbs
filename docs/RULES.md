# Project Rules

## Workflow

1. Inspect affected routes, components, types, and patterns before editing.
2. Keep changes scoped and preserve unrelated work.
3. Prefer reusable components when behavior repeats.
4. Validate in proportion to risk: focused lint, TypeScript, tests when present, and production build for release-sensitive work.
5. Update documentation before declaring completion.

## Mandatory documentation

Every development change must add a `PROGRESS.md` entry containing:

- ISO date
- Outcome
- Main files or areas
- Checks run and exact outcomes
- Known limitations or next step

Update every topic document whose facts changed. New errors and resolutions belong in `TROUBLESHOOTING.md`.

## Product rules

- Public routes use storefront chrome; admin routes do not.
- Root hydration suppression is limited to extension-injected `<body>` attributes. Application-owned hydration mismatches must be fixed at their source, not suppressed.
- The Admin header Storefront action must open the public root in a new, opener-isolated tab so the current protected workspace remains open.
- Storefront-owned static copy—including visible labels, accessible names, empty/error states, FAQ questions/answers, About narratives, and legal-policy bodies—must use semantic dot-path keys from the relevant nested section in `english.json` and `gujarati.json`; both files must have the same section tree, leaf keys, and interpolation placeholders. Public routes mount the language provider, while Admin routes remain English and outside that provider. Repository-authored Product/Category/Blog/Gallery/Testimonial/Team content must continue selecting its persisted language block instead of being duplicated in the static dictionary.
- Indian storefront prices use rupees and Indian formatting unless source data requires otherwise.
- Static or browser-local features must be labeled mock, demo, or local in documentation.
- Placeholder actions must not be described as complete functionality.
- Dynamic routes must handle unknown IDs safely, normally through Next.js not-found behavior.
- Visible catalog links and Product breadcrumbs must use `/allproducts`; `/shop` is a legacy redirect only and must not be emitted by current storefront UI.
- Header Categories triggers must use the same closed design on every route. Orange active styling reflects an expanded desktop/mobile category menu only, not whether the visitor is on All Products or a Product detail page.
- Desktop and mobile Header category menus must use the authoritative Category repository, never a separate hard-coded/seed fallback list. An intentional empty catalog shows an empty message while retaining the All Products path.
- The homepage Hero must preserve the established English spacing. Gujarati may use tighter vertical spacing and a bounded desktop height, but the badge-to-heading gap must remain explicit and mobile height must stay content-driven.
- Contact phone numbers are invariant dialable data: keep each complete number LTR, excluded from machine translation, and non-wrapping. When two numbers share a row, their separator must not shrink.
- Products must reference an existing Category key. Category keys are backend-generated and immutable through Admin edits, so renaming a Category leaves assigned Products intact; Categories with assigned Products cannot be deleted.
- Home catalog sections, all-products filtering, product detail routes, category cards, and sitemap entries read through the catalog repository rather than importing mutable runtime arrays.
- The homepage Magazine section must source only admin-managed Products assigned to the `magazines` Category. It must not infer membership from Product titles/badges or render fallback Magazine cards. When the Category has no Products, retain the section heading, View All action, and standard dashed empty-collection message.
- Cart is an explicitly browser-local convenience. Stored records must remain bounded, validated, non-sensitive, and must never be described as reserved inventory or a completed order. The header count is an unread-update badge: a successful Add to Cart shows it, visiting `/cart` acknowledges it without deleting items, and a later Add to Cart shows it again.
- Product-card and Product-detail Buy Now actions must open WhatsApp with a greeting, title, quantity, price, selected variant details when present, and an absolute Product link. Cart must prepare the same details for every selected Product plus the aggregate total.
- Product-detail variant chips and purchase controls must remain compact. Desktop CTAs use bounded widths instead of filling the entire information column, while mobile Add to Cart and Buy Now share a balanced two-column row with touch-safe 44-pixel height.
- When a Product has multiple images, its detail page keeps a compact square main-image stage above one horizontal strip of 80-pixel square thumbnails at every viewport width; additional thumbnails scroll horizontally and must not switch to a left-side vertical column.
- Product cards expose only two explicit action buttons: Buy Now and Add to Cart. Both actions must remain equal-height and single-line at supported card widths, and Add to Cart uses the same shopping-cart glyph as the Header Cart action. The Buy Now label must remain text-only, without a WhatsApp icon or visible WhatsApp wording, while its action continues to open the prepared WhatsApp request. Do not add separate View, Wishlist, or WhatsApp-icon actions; the image/title may continue linking to Product detail. The site-wide floating WhatsApp helper is separate from Product-card actions and uses the recognizable WhatsApp glyph.
- The only shopper utility page is Cart. Wishlist, Checkout, customer login, registration, profile, and order-history pages are outside product scope; legacy URLs redirect to Cart or All Products.
- WhatsApp requests must state that availability, shipping, final total, and payment still require GTBS confirmation.
- Contact actions must use the server-side Resend route, identify real delivery status, and surface controlled provider failure instead of logging or claiming false success. The browser must never receive the Resend key.

## UI rules

- Build mobile-first and verify tablet/desktop behavior.
- Avoid widths that cause viewport overflow.
- Tables must scroll or transform on small screens.
- Controls need focus/hover states, accessible names, and sufficient touch targets.
- Prefer `next/image` for content images.
- Preserve the GTBS visual language: readable system sans/serif stacks, orange accent, and restrained neutrals.
- Above-the-fold LCP images may use eager priority; below-the-fold images must remain lazy. Responsive `next/image` fill layouts require an accurate `sizes` value.
- Modal/lightbox navigation must support Escape, visible focus, background scroll restoration, and an accessible dialog name. Respect `prefers-reduced-motion` for nonessential animation.

## Data and API rules

- Validate untrusted input at route boundaries.
- Return consistent JSON errors and appropriate status codes.
- Keep server secrets and crypto out of Client Components.
- Do not mutate imported domain data.
- Introduce typed service/repository functions when persistence is added.
- PostgreSQL schema changes use new ordered migrations and `pnpm db:setup`; previously applied SQL files must remain immutable. Runtime content access stays behind the Drizzle repository, and one-time seed/import logic must honor `gtbs_settings.content_initialized` so deleted records are not recreated.
- Live API smoke tests use unique temporary records, verify every content CRUD domain, and clean database/provider artifacts on success or failure. Run them only against an explicitly reviewed target.
- Admin state-changing requests require same-origin verification and the `X-GTBS-Admin-Request` marker.
- Catalog/blog/gallery/testimonial/team admin APIs also require a verified admin session and bounded, strict Zod payloads.
- Category create/update requires separate bounded English and Gujarati names. The editor and Product inline Category popup must start on English, use `Next` without persistence, and expose the only final Create/Update action on the Gujarati step with a `Previous` path back to English. The repository generates a unique slug on create and retains it on update. Slugs and descriptions must not appear in the admin form/list or home-page Category cards; stored legacy fields remain for routing and file compatibility only.
- When Gujarati is selected, repository-backed homepage Category cards and All Products Category filters must prefer the saved Gujarati Category name; legacy Categories without Gujarati content display the stored English name.
- Category Previous and final Create/Update actions must stack on narrow screens and share one row from `sm` upward. The final label must remain single-line, with Previous compact and submit using the available width.
- Product create/update accepts one Price and no Original price. Badge is optional but, when present, must be one of Best Sellers, New Releases, Trending Products, or Accessories.
- Product specifications must be arbitrary bounded groups rather than fixed book fields. Their admin cards must match Variant cards: one name input followed by a divided Values area with individual addable/removable inputs. The client may group/flatten these inputs, but persisted Product specifications remain `{ name, value }` records. Product variants must be optional named groups whose options are authored through individual addable/removable inputs, never an `Options, one per line` textarea; do not hardcode Size, Color, Format, or any other group as universally required. A partially completed specification or variant group must be reported before advancing or saving.
- New Product mutations must reject legacy fixed Format/book-detail fields. Existing stored Products may read those fields only for backward-compatible display and edit migration.
- Product create/edit must not expose or submit Available for sale, Stock count, Rating, or Reviews count. Their optional persisted fields exist only for legacy catalog compatibility until a separate inventory/review workflow is designed.
- Product create/edit and storefront Product surfaces must not expose or submit Brand / creator or Brand / creator details. Legacy `author` and `authorBio` fields remain optional at rest only so old content files validate.
- The Product form may create a missing Category from an Add category modal only through the existing protected Category API; after success, the returned Category must be added to the selector and selected without requiring a page reload.
- Blog banners, Gallery covers/photos, Product card/detail images, and Team member images accept JPG, PNG, or WebP only, with a 500 KiB maximum per image. A Product may have one card image and at most 6 extra detail images. Persist/return UploadThing's canonical `ufsUrl`; do not consume deprecated `url` or `appUrl` getters.
- Product detail-image selections must preview before save, support individual removal, and include the card image first on the public detail gallery. Managed images removed during update/delete receive best-effort provider cleanup.
- Product Core details must stack on mobile and use two columns from `sm` upward, with Category spanning its row and Badge/Price paired without horizontal overflow.
- Product create/update pages must start with English Title, Specifications, Variants, Short description, Detailed overview, and Features. `Next` validates the English/shared fields and reveals the preserved Gujarati fields without saving; only the Gujarati step may perform the final create/update submission. `Previous` must restore the preserved English draft. Category, Badge, Price, and images remain shared; Product ID/slug is backend-owned, generated from the English title on create, and retained on edit.
- Admin Product text inputs and textareas must suppress the global orange focus outline and use a subtle neutral focus border/ring, while retaining a visible keyboard focus state.
- Product Features must be authored as up to 30 individual English/Gujarati inputs with adjacent add and delete controls, not a `Features, one per line` textarea. Add inserts a new field immediately after the selected feature; blank inputs are omitted and exact duplicates collapse on submission.
- Product mutations require separate English and Gujarati titles. Selecting Gujarati on the storefront must immediately use saved Gujarati Product text across cards, catalog title search, detail breadcrumbs, product information, variants, overview/features, specifications, and related cards. Legacy Products without the block retain stored English content; external machine translation must not mutate React-owned nodes.
- A gallery can contain at most 12 extra photos; the cover image is separate from that limit.
- Blog and Gallery index routes must open on their list table, keep admin navigation visible, place Add above the table, and expose View, Edit, and Delete actions for each row. Add and Edit must use separate protected `/add` and `/[id]/edit` pages rather than inline forms.
- Blog and Gallery tables show at most 8 rows per page, support case-insensitive text search and category filtering, and reset to page 1 whenever either filter changes.
- Blog and Gallery create, update, delete, and mutation failures must display an admin toast. Destructive table actions must use the shared confirmation modal and must not call the API until the admin explicitly confirms.
- Blog Article content uses the Tiptap editor and persists only bounded, allow-listed rich-text JSON. Public formatting must render through explicit React components rather than unsanitized HTML, and legacy section-only posts must remain readable/editable.
- Blog create/update forms require separate authored English and Gujarati title, category, author name/role, and rich article content. Date, banner, and avatar remain shared between languages; the backend owns the slug.
- Blog create/update pages must start on English and advance through `Next` to Gujarati while preserving both languages' unsaved fields/editor state. Shared Date, Banner image, and Author avatar controls stay visible together in the Common fields card. Only the Gujarati step may submit, and `Previous` must restore the English step without losing values.
- Gallery create/update pages must start on English and advance through `Next` to a Gujarati final-submit step while preserving both languages' unsaved values. Date and Gallery images remain shared; each language requires title, category, location, and description while organizer is optional. `Previous` returns to English. Slug and Subtitle must not appear in or be accepted by Gallery CRUD.
- Selecting Gujarati must immediately use saved Gujarati Gallery content across list search/categories, album cards, detail pages, breadcrumbs, organizer credit, and related albums. Legacy records without Gujarati data retain stored English content.
- Gallery cover and extra-photo controls, their inline errors, and photo previews stay together in the Gallery images card.
- Selecting Gujarati must immediately use saved Gujarati Blog content across home cards, the Blog list/search/categories, detail pages, breadcrumbs, and related articles. Legacy records without Gujarati data retain stored English content.
- Testimonial admin must provide a searchable, eight-row paginated list with Add, Edit, and confirmation-based Delete actions. Add/Edit must use protected standalone routes and the shared English-to-Gujarati step indicator beside `Back to list`.
- Testimonial forms require separate English and Gujarati customer name, role, and testimonial text, plus one shared integer Rating from 1 through 5. English `Next` must not persist data; Gujarati validation and submit perform the final mutation. `Previous` must preserve both drafts.
- The homepage Testimonial carousel must read repository data, render each saved Rating, switch reactively to authored Gujarati content without retranslating it, and render no Testimonial section when the persisted list is empty.
- Team admin must provide a searchable, eight-row paginated list with Add, Edit, and confirmation-based Delete actions. Add/Edit must use protected standalone routes and the shared English-to-Gujarati step indicator beside `Back to list`.
- Team forms require separate English and Gujarati member name and role values plus one shared image. English `Next` must only advance local form state; Gujarati submit performs the final mutation, and `Previous` must preserve both drafts.
- The About-page Team grid must read repository data, switch reactively to authored Gujarati name/role text without retranslating it, preserve repository order, and render no Team section when the persisted list is empty.
- Client image type, size, and gallery-count validation messages must render below the file input that caused them, with accessible invalid-state attributes; do not place these field errors only in a form-level banner.
- Valid pending Gallery photos must show an immediate removable preview marked `New`. Repeated selections append until the combined retained-plus-pending count reaches 12; temporary preview URLs must be revoked when no longer used.
- Public Gallery detail pages display at most 8 photos initially in a responsive 1/2/4-column grid. View more reveals the next batch, and the lightbox must navigate only photos currently revealed to the visitor.
- While the public Gallery lightbox is open, Left Arrow and Right Arrow navigate the revealed photo set and Escape closes it; keyboard listeners must be removed whenever the viewer is closed.
- Public Gallery detail links and SEO URLs must use the stored title-derived slug. A resolvable non-canonical identifier must redirect to that slug URL; an unknown identifier returns not found.
- Admin sidebars expose only implemented destinations: Overview, Products, Categories, Blogs, Gallery, Testimonials, and Team. Do not show placeholder navigation for unavailable modules.
- Admin Overview must derive its figures from the Product, Category, Blog, Gallery, Testimonial, and Team repository arrays on each protected request. Do not present order, revenue, customer, inventory, or analytics figures until an authoritative domain model exists for them.
- The Admin sidebar/header must live in the shared `/admin` layout and persist across protected route transitions. Page modules render only their heading/content; active navigation is derived from the current pathname, and loading fallbacks must replace only the main content panel. Login remains visually outside the panel shell, while server authorization remains mandatory on every protected page.
- Persisted content mutations go through `contentRepository.ts`; UI and route handlers never write application data to the filesystem.
- Production Admin auth must fail closed when PostgreSQL, `ADMIN_EMAIL`, the matching HTTPS origins, or a strong stable `BETTER_AUTH_SECRET` is missing. Passwords and password hashes are database records, never environment values.
- Public Better Auth signup remains disabled. `pnpm admin:setup` may create only the configured Admin identity through a hidden interactive password and must refuse an existing account.
- Every protected page/API validates the Better Auth database session and checks its normalized email against `ADMIN_EMAIL`; UI visibility and possession of any non-Admin session are never authorization.
- Login/reset throttles and reset tokens remain PostgreSQL-backed. Vercel Firewall/WAF controls may supplement but never replace application authorization.
- Forgot password uses Better Auth's generic email response and a Resend-delivered, one-hour, single-use link. Successful replacement must revoke existing sessions. Never log or expose the Resend key, reset token, password/hash, or session cookie.
- Outbound application email uses the fixed `GTBS Support <support@gtbsbooks.com>` identity on the verified `gtbsbooks.com` domain.
- `main` is the Vercel Production branch and `staging` is the only auto-deployed Preview branch. Keep all other Git-triggered deployments disabled in `vercel.json`.
- Every Vercel Preview response must remain search-excluded by page metadata, site-wide `X-Robots-Tag`, omitted search verification, and disallow-all `robots.txt`; production must remain indexable.

## Git and files

- Never commit or upload `.env`, `.env.*`, generated output, credentials, tokens, or local Vercel metadata; maintain both `.gitignore` and `.vercelignore` because Git and CLI deployment have separate file-selection boundaries.
- Do not overwrite unrelated user work.
- Avoid destructive Git/filesystem actions without authorization.
- Keep `.next/` and TypeScript build output out of source changes.
