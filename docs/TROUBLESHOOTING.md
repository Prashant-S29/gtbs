# Errors and How to Solve Them

## Diagnostic order

1. Reproduce and capture the exact command, route, status, and message.
2. Run the narrowest relevant check.
3. Check environment configuration without printing secrets.
4. Identify code, cache, dependency, or OS-permission origin.
5. Apply the smallest fix, rerun the check, and update this file plus `PROGRESS.md`.

## Admin Overview shows sample sales and order figures

**Symptom:** Overview displays revenue, orders, inventory, customers, or sales history that does not change when Product, Category, Blog, Gallery, Testimonial, or Team content changes.

**Cause resolved 2026-09-06:** the original dashboard was a presentation mock with hard-coded commerce figures and no connection to the content repository.

**Solution:** the protected Overview now loads all six managed content arrays concurrently from `contentRepository.ts` and derives its summary cards, Product-by-Category distribution, Gallery photo total, Testimonial rating average, Team role count, and content snapshots from those records.

**Prevention:** add dashboard metrics only when backed by a typed authoritative data source, and retain the integrity check that rejects the former mock revenue/order sections.

## Admin Storefront action replaces the current tab

**Symptom:** selecting Storefront from the Admin header navigates away from the management panel, interrupting the current Admin context.

**Cause resolved 2026-09-06:** the action was a normal same-tab Next.js link to `/`.

**Solution:** open the Storefront link with `target="_blank"` and `rel="noopener noreferrer"`, and expose its new-tab behavior in the accessible label.

**Prevention:** retain the new-tab and opener-isolation attributes when changing the persistent Admin header actions.

## Deleted Admin categories remain in the Header dropdown

**Symptom:** after deleting every Category in Admin, the desktop or mobile Header still shows Holy Bibles, Christian Living, Devotionals, Kids & Youth, and Accessories.

**Cause resolved 2026-09-06:** Header owned a separate five-item hard-coded category array, so it never observed repository mutations or the intentional empty-catalog marker.

**Solution:** the root layout reads `getCategories()` and passes the records through `SiteChrome` to Header. Both menus derive links from stored slugs, localize stored names, and show `No categories available` when the authoritative array is empty. Existing mutation-driven public-layout revalidation refreshes the shared data.

**Prevention:** keep all storefront Category navigation on repository-provided records and retain integrity coverage that rejects the former static labels in Header source.

## Gujarati Contact phone numbers split across lines

**Symptom:** in the Gujarati Contact section, `+91` and the remaining digits appear on separate lines, making each call number difficult to read.

**Cause resolved 2026-09-06:** the translated phone row allowed normal whitespace wrapping, and the former external translator could wrap/localize invariant dialable text into additional inline nodes.

**Solution:** mark both number links `translate="no"`/`notranslate`, render them LTR with tabular numerals and `white-space: nowrap`, keep the row non-wrapping, and prevent the separator from shrinking.

**Prevention:** treat phone numbers as non-translatable structured data and preserve each complete number as one non-wrapping link.

## Gujarati homepage hero has excessive vertical space

**Symptom:** after selecting Gujarati, the homepage banner becomes taller than English and shows a large blank area between the translated badge and main heading.

**Cause resolved 2026-09-06:** the shared English spacing did not account for Gujarati glyph metrics, so implicit inline flow and the content-driven minimum height exaggerated vertical gaps.

**Solution:** the Hero resolves React-owned copy from the English/Gujarati dictionary. Scoped `html[lang="gu"]` CSS gives the badge/heading flex column an 8-pixel gap and applies compact internal spacing plus a bounded 420-pixel desktop stage, while English classes and mobile content-driven height remain intact.

**Prevention:** keep translated heading groups in explicit layout containers and cover the Gujarati gap/desktop-height contract in the site-integrity test.

## Gujarati switch throws `removeChild` NotFoundError

**Symptom:** changing or rendering the homepage in Gujarati opens the Next.js runtime overlay with `Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.`

**Cause resolved 2026-09-06:** Google Translate rewrote text nodes outside React. A later React reconciliation attempted to remove a node that the translator had already replaced, so the expected parent-child relationship no longer existed.

**Solution:** remove the Google Translate script, hidden selector, cookie-driven translation lifecycle, and reload behavior. Render English/Gujarati static UI through the checked-in JSON dictionary and React `t(key)` calls; continue selecting Admin-authored Gujarati Product, Category, Blog, Gallery, Testimonial, and Team fields directly. React now owns every rendered translation node.

**Prevention:** keep English/Gujarati dictionary keys in parity, render language changes through React, and never attach an external translator that mutates React-owned DOM. Site-integrity coverage rejects the former Google runtime markers.

## Create Category button wraps onto two lines

**Symptom:** on the Gujarati Category step, the orange Create Category button looks cramped and its label breaks into two lines beside Previous.

**Cause resolved 2026-09-06:** both buttons used equal flex widths inside the narrow Category editor, while their padding, icon, gap, and unequal label lengths competed for the same space.

**Solution:** actions stack at full width on narrow viewports. From `sm` upward Previous uses a compact 118-pixel width and the submit action receives the remaining space; labels use `whitespace-nowrap` and icons use `shrink-0`.

**Prevention:** preserve the responsive Category action-group classes and test for the non-wrapping/fixed-secondary-button contract when changing button copy or icons.

## Category saves without the English-to-Gujarati step flow

**Symptom:** Category create/edit immediately submits one English name, has no `Next`/`Previous` flow, or the Product form's inline Add Category request fails after Gujarati Category content becomes required.

**Cause resolved 2026-09-06:** Categories originally had no localized domain field, so their inline CRUD was excluded from the shared bilingual workflow and Product's category popup sent only `{ name }`.

**Solution:** Category drafts require `{ name, gujarati: { name } }`. Both Category entry points start on English, advance locally to Gujarati, and submit only from the Gujarati step. Stored Gujarati names are selected on repository-backed Category cards and catalog filters; legacy records remain valid without the optional stored block.

**Prevention:** keep the Category manager and Product inline creator aligned with `AdminBilingualFormSteps`, and update every Category creation call whenever the strict Category draft contract changes.

## Admin CRUD asks for slugs or reports duplicate slugs

**Symptom:** Product, Category, Blog, or Gallery create/edit asks the admin to understand a route slug, exposes that internal value in a list, or rejects a create because an admin-entered slug already exists.

**Cause resolved 2026-09-05:** those identifiers were authored and normalized in browser forms even though they are persistence/routing concerns. Renaming a Category slug also required rewriting assigned Product relations.

**Solution:** Admin mutation drafts no longer accept Product `id` or Category/Blog/Gallery `slug`. The repository derives a bounded lowercase key from the validated English title/name during create, appends a numeric suffix when needed, and retains the stored identifier on update. Public URLs and Category relationships therefore remain stable when visible content is edited.

**Prevention:** keep route-key generation in `contentSlug.ts` and repository create mutations. Do not reintroduce Slug controls, client slug helpers, or identifier fields in mutation schemas; continue using stored keys internally for routes and relations.

## Admin sidebar navigation looks like a full-screen refresh

**Symptom:** selecting Products, Categories, Blogs, Gallery, Testimonials, Team, or Overview makes the entire Admin screen—including sidebar/header—disappear and redraw.

**Cause resolved 2026-09-05:** every page instantiated its own complete `AdminContentShell`, so a route transition replaced the navigation chrome together with page content. The Admin-level loading fallback also occupied that replaceable child boundary, intensifying the full-refresh effect.

**Solution:** `/admin/layout.tsx` now owns a persistent pathname-aware `AdminPanelShell`. Page-level `AdminContentShell` renders only headings/content, and the loading skeleton stays inside the stable main area. Navigation remains Next.js `Link`-based and prefetchable; only the destination content changes.

**Prevention:** keep shared route chrome in the nearest persistent layout, do not move the sidebar/header back into individual Admin pages, and keep protected server authorization independent from client-side pathname styling.

## Admin Product Features require newline-separated textarea content

**Symptom:** Product Features are authored in one `Features, one per line` textarea, so an admin cannot add or delete feature fields individually.

**Cause resolved 2026-09-05:** the Product form converted uncontrolled textarea content into an array only during submission.

**Solution:** English and Gujarati Features now use controlled individual inputs with plus and trash icons. Plus inserts a blank field directly after the selected row, trash removes that row, saved values reload separately, and submission retains the existing trimming, duplicate collapse, and 30-item API limit.

**Prevention:** keep Product feature drafts as controlled string arrays and preserve the individual add/remove controls instead of reintroducing newline parsing.

## Admin Product inputs show a thick orange double outline

**Symptom:** focusing a Product-form input, especially Variant name, displays a prominent orange outline and ring around the complete field.

**Cause resolved 2026-09-05:** Product-form classes originally added an orange focus border/ring while the global `:focus-visible` rule added a second orange outline. Replacing only the Tailwind focus utilities was insufficient because the later unlayered global rule still won the CSS cascade.

**Solution:** every Product-form text input/textarea uses the dedicated `admin-product-input` class, and a later scoped global rule explicitly sets its focus-visible outline to none. The form keeps one subtle slate border/ring focus state, so keyboard focus remains visible without the orange highlight.

**Prevention:** keep the Product form's shared input/textarea classes and individual variant-option class aligned; do not re-add orange focus utilities without accounting for the global focus-visible rule.

## Admin Product specifications or variant options are difficult to add

**Symptom:** Add specification appears ineffective, an incomplete row fails only after submission, or variant options must be typed into one `Options, one per line` textarea without individual delete controls.

**Cause resolved 2026-09-05:** the Product form relied on the final strict API validation for partial specification/variant data, and variant options were represented as newline-split textarea content rather than independently controlled fields.

**Solution:** Specifications now use the same card structure as Variants: a full-width name input, divided Values section, Add value action, and individual value inputs with delete icons. Existing repeated names such as Material are grouped for editing and flattened back into the unchanged `{ name, value }` schema on save. Every Variant group uses the equivalent individual Options controls. The client reports incomplete English or Gujarati groups before changing steps or saving, while the API schema remains authoritative.

**Prevention:** keep specifications and nested variant options as controlled typed arrays, preserve accessible labels on icon-only delete buttons, and retain the pre-submit partial-row checks when changing the editor layout.

## Categories button design changes between pages

**Symptom:** the closed Header Categories button appears orange on All Products/Product detail but white and outlined on Home or other pages.

**Cause resolved 2026-09-05:** the trigger's visual state was tied to catalog route detection, so page navigation changed the control design even when its menu was closed.

**Solution:** desktop and mobile triggers now use route-independent closed styling and switch to orange only while their own category menu is expanded. Both controls expose their expanded state to assistive technology.

**Prevention:** keep navigation-route highlighting separate from disclosure open/closed styling; do not reintroduce pathname checks into the Categories trigger classes.

## Product-detail action buttons stretch across the full panel

**Symptom:** Add to Cart and Buy Now become very wide on desktop, making the Product information section look heavy and unbalanced.

**Cause resolved 2026-09-05:** the purchase row assigned both CTAs flexible `1fr` grid columns, so each button consumed half of all remaining horizontal space.

**Solution:** variant chips use tighter spacing, the quantity stepper is compact, and the two CTAs now use bounded content widths on larger screens. On mobile they remain touch-safe and share an equal two-column row.

**Prevention:** do not place Product-detail CTAs in unrestricted `minmax(0, 1fr)` desktop columns; preserve the compact responsive action group and its 44-pixel control height.

## Product thumbnails move into a left-side vertical column

**Symptom:** multiple Product images appear vertically beside the main image on tablet/desktop instead of horizontally underneath it.

**Cause resolved 2026-09-05:** `ProductImages.tsx` changed its flex direction to a row at the `md` breakpoint and changed the thumbnail container to a vertical column.

**Solution:** a compact square main-image stage now precedes a horizontal, overflow-scrollable row of 80-pixel square thumbnails at every breakpoint. The main image retains `object-contain`, while selecting a thumbnail still replaces it and exposes pressed-state semantics.

**Prevention:** keep the Product gallery wrapper in column flow and do not apply breakpoint-specific `flex-row` or thumbnail `flex-col` utilities.

## Homepage shows fake Magazines that are not in Admin Products

**Symptom:** the homepage displays Faith & Life Magazine, Christian Living Digest, or The Good News Monthly even though those Products do not exist in the admin catalog.

**Cause resolved 2026-09-05:** `Magazines.tsx` rendered a three-item static fallback whenever no dynamic Magazine Products were found; homepage selection also accepted title/badge guesses instead of only the Category relationship.

**Solution:** the static records and cover fallback were removed. The homepage now selects only Products assigned to the `magazines` Category; when no matching Product exists, it keeps the section visible and renders the standard dashed empty-collection panel.

**Prevention:** create the `magazines` Category through Admin Categories when it is missing, then assign Magazine Products to it; do not add hardcoded Product fallbacks or title/badge matching to the homepage section.

## Header Cart badge returns after leaving the Cart page

**Symptom:** the orange Cart count remains visible, or reappears on another page, even after the shopper has opened `/cart` and reviewed the current items.

**Cause resolved 2026-09-05:** the header rendered the badge whenever Cart quantity was greater than zero, so it represented total stored items rather than an unread Cart update.

**Solution:** Add to Cart now sets a separate browser-local unread marker. Opening `/cart` acknowledges that marker without removing any Cart line, so the badge stays hidden on later navigation until another Product is added.

**Prevention:** keep Cart contents and notification acknowledgement as separate state; changing badge visibility must never clear or mutate the shopper's Cart.

## Broken navigation links return 404 (e.g., /books/* or /magazines/*)

**Symptom:** Clicking category links in Header or Magazine cards on the homepage returns a 404 Not Found page.

**Cause:** Legacy template anchor tags pointed to static placeholder paths like `/books/bibles` or `/magazines/faith-life` that did not exist in the App Router.

**Solution:** Route category and collection links through the dynamic catalog query routes: `/allproducts?category=${slug}` and `/allproducts`. Product breadcrumbs label the catalog level as Products and use the same canonical route. Connect dynamic homepage sections (e.g. Magazines) to `getProducts()` filtered by category/badge.

**Prevention:** Always verify link destinations against the active `src/app` route tree and use dynamic catalog filters rather than hardcoding static mock paths. Keep `/shop` only as the backward-compatible redirect; do not use it in visible links or canonical metadata.

## Buy Now opens WhatsApp without quantity or Product details

**Symptom:** a Product action opens a generic WhatsApp enquiry that omits the selected quantity, variants, price, or Product link.

**Cause resolved 2026-09-05:** Product cards, Product detail, and the former Checkout surface constructed separate message formats.

**Solution:** all sale actions now use `src/lib/whatsappOrder.ts`. Product Buy Now includes one selected Product; Cart includes every selected line and the aggregate total. Both flows include the greeting, quantity, price, variant details when present, and absolute Product links.

**Prevention:** add or change WhatsApp order fields only in the shared builder, then browser-test both one-Product and multi-Product flows.

## Removed shopper utility URL is requested

**Symptom:** an old bookmark requests `/checkout`, `/wishlist`, `/login`, `/register`, or `/profile` even though those pages are no longer part of the storefront scope.

**Resolved 2026-09-05:** the route implementations were removed. Next.js redirects Checkout to Cart and the Wishlist/customer URLs to All Products, so visitors re-enter the supported Product → WhatsApp flow without a 404.

## Product, Blog, or Gallery lists stay on skeletons and feel slow

**Symptom:** The route shell appears, but actual cards wait for hydration and a later `/api/content/catalog`, `/api/content/blogs`, or `/api/content/galleries` request. Repeated dynamic requests also reread and revalidate the same content JSON.

**Cause resolved 2026-09-03:** the three index pages were entirely client-rendered for data loading even though the content repository is server-local. This created a server HTML → JavaScript hydration → API request → render waterfall. Repository getters also performed duplicate filesystem reads and whole-document Zod parsing for concurrent or repeated calls.

**Solution:** route-level Server Components now load and serialize the initial arrays into focused interactive Client Components. The repository deduplicates its initial read and retains the validated snapshot until a successful mutation atomically publishes its replacement. The below-the-fold Magazine image no longer receives eager priority over visible content.

**Prevention:** prefer server-provided initial data for server-owned sources, keep filter/search interaction at a narrow client boundary, and reserve `priority` for above-the-fold images that affect LCP. In development, first visits still include route compilation time; compare warm requests or a completed production build when evaluating runtime performance.

## Admin password-reset email does not arrive

**Symptom:** Forgot password shows the generic success message, but no reset link arrives.

**Cause:** Unknown email addresses intentionally receive the same response without delivery. For the configured Admin, likely causes are missing/invalid `RESEND_API_KEY`, unverified `gtbsbooks.com`, provider quota/reputation, or spam filtering.

**Solution:** use the exact `ADMIN_EMAIL`, verify the Resend domain and send-scoped key in deployment, inspect Resend delivery status, and check spam. The fixed sender is `GTBS Support <support@gtbsbooks.com>`. Never print the key or reset URL.

**Prevention:** retain generic discovery responses and verify real Resend delivery after origin/provider changes.

## Admin password-reset link is invalid or expired

**Symptom:** the link reaches `/admin/reset-password` but reports an invalid/expired token.

**Cause:** Better Auth reset links are single-use, expire after one hour, and depend on the PostgreSQL `auth_verification` record. The link may have been consumed, expired, truncated, connected to another database, or generated under a mismatched `BETTER_AUTH_URL`.

**Solution:** request a fresh link on the canonical HTTPS origin and confirm migrations plus `DATABASE_URL`, `BETTER_AUTH_URL`, and `NEXT_PUBLIC_SITE_URL` target the intended deployment.

**Prevention:** keep all auth instances on the same PostgreSQL database and canonical origin; never persist reset state in process memory/files.

## New Admin password cannot be saved

**Symptom:** a valid reset page cannot complete the password change.

**Cause:** PostgreSQL is unavailable/mismatched, Better Auth tables are missing, or the verification was already consumed. The application filesystem is not involved.

**Solution:** run `pnpm db:migrate` against the intended database, verify connectivity, then request a fresh link. Successful reset updates `auth_account` and revokes existing `auth_session` rows.

## Admin login says it is unavailable

**Cause:** `ADMIN_EMAIL`, `DATABASE_URL`, stable 32+ character `BETTER_AUTH_SECRET`, or matching HTTPS `BETTER_AUTH_URL`/`NEXT_PUBLIC_SITE_URL` is missing/invalid, migrations are absent, or the configured Admin was not bootstrapped.

**Solution:** configure those Vercel values, run `pnpm db:setup`, and run `pnpm admin:setup` once if the Admin does not exist. The hidden setup password is hashed directly into PostgreSQL; do not configure password/hash environment variables.

## Correct Admin details are rejected

**Likely causes:** email/password mismatch, `ADMIN_EMAIL` points to another identity, a password reset changed the credential, the deployment uses another database, or the account was never bootstrapped.

**Solution:** confirm configuration presence without displaying values. Emails are normalized lowercase and passwords are case-sensitive. Use Forgot password for an existing identity; do not rerun bootstrap over an existing user.

## Admin request returns HTTP 403

**Cause:** Better Auth rejected an untrusted origin, or a content mutation lacked matching Origin/fetch-site metadata or `X-GTBS-Admin-Request: 1`.

**Solution:** use the canonical HTTPS origin, make `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` match it, and preserve same-origin request headers. Do not disable the check.

## Admin login returns HTTP 429

**Cause:** Better Auth's PostgreSQL limiter reached the custom five-attempt/15-minute sign-in rule or the deployment firewall applied an outer limit.

**Solution:** wait for the retry window, then verify the credential. Investigate repeated failures without logging passwords/tokens. Do not clear the database limiter to bypass a real attack.

## Admin redirects back to login

**Likely causes:** cookie blocked, database session expired/revoked, `BETTER_AUTH_SECRET` changed, `ADMIN_EMAIL` changed, hostname changed, or inconsistent production HTTPS origins.

**Solution:** verify the secure Better Auth cookie and matching origins, then sign in again. Password reset intentionally revokes existing sessions.

## Better Auth sign-out returns HTTP 415

**Symptom observed 2026-09-06:** the first migrated live smoke reached `/api/auth/sign-out` but received `Content-Type is required`.

**Cause:** Better Auth's POST contract expects JSON content type; the old custom logout route accepted an empty untyped request.

**Resolved 2026-09-06:** `authClient.signOut()` owns browser logout, and the HTTP smoke sends an explicit empty JSON object. Do not recreate a custom cookie-deletion route.

## Server script cannot resolve `server-only`

**Symptom observed 2026-09-06:** a direct auth bootstrap diagnostic failed with `ERR_MODULE_NOT_FOUND: server-only` under strict pnpm resolution.

**Cause:** server modules imported the marker without declaring it as a direct package dependency.

**Resolved 2026-09-06:** `server-only` is now a direct runtime dependency. Standalone diagnostics that intentionally import marked modules use Node's `react-server` condition; normal setup avoids those modules and writes Better Auth-compatible records through its exported password utility.

## Admin login reports a hydration mismatch

**Symptom:** React reports that server-rendered attributes do not match client properties and points to the admin email input.

**Cause:** The remembered email previously participated in the input's rendered attributes through a browser-storage snapshot. Server rendering cannot read `localStorage`, so persisted browser state could diverge from the server HTML during hydration.

**Solution:** Render the email and remember-me inputs with stable empty/unchecked HTML, then copy any remembered email into their uncontrolled DOM refs after hydration. Keep browser-only storage out of server-visible initial attributes.

**Prevention:** Values from `localStorage`, locale APIs, extensions, time, or randomness must not alter the first client render unless the server receives and renders the same snapshot.

## Gallery or other pages report Grammarly body-attribute hydration mismatch

**Symptom:** React reports an attribute hydration mismatch on `<body>` and the diff contains `data-new-gr-c-s-check-loaded` or `data-gr-ext-installed`, even though the requested page renders normally.

**Cause:** the Grammarly/browser writing extension injects those attributes after the server response but before React hydration. They are not generated by the Gallery, Drizzle data, date formatting, or application render logic.

**Resolved 2026-09-06:** the root `<body>` now uses narrowly scoped `suppressHydrationWarning`, covering extension-owned body attributes without suppressing mismatches inside application descendants. Restart/hard-refresh after pulling the layout update. Disabling the extension for localhost also removes the injected attributes.

**Prevention:** only suppress a reviewed external mutation at its exact owner element. Continue investigating any mismatch whose diff points to application text, structure, classes, dates, random values, or nested components.

## Full ESLint fails

**Symptom:** `npm run lint` exits non-zero while newly changed admin files pass.

**Known causes observed 2026-08-30:** synchronous `setState` in effects, reading refs during Swiper renders, explicit `any`, unescaped JSX apostrophes, unused imports, and raw `<img>`.

**Affected areas:** `allproducts/page.tsx`, blogs/gallery pages, `SearchBar.tsx`, several home carousel components, and isolated typing/JSX issues.

**Solution:** Fix by category and rerun full lint. During scoped work run focused ESLint too, but never report a focused pass as a full repository pass.

**Observed 2026-08-31:** The production-auth change's focused ESLint passed, while repository-wide `npm run lint` still reported the pre-existing 28 errors and 14 warnings in the categories above.

**Resolved 2026-08-31:** filter/search handlers now reset pagination in the same user event instead of an effect, Swiper navigation moved ref access into event handlers, explicit `any` and unused code were removed, JSX text was escaped, and blog avatars moved to `next/image`. `npm run lint` now passes with 0 errors and 0 warnings.

**Prevention:** Keep the full lint command in every change validation. Do not reintroduce state-mirroring effects, render-time ref reads, raw content images, or untyped event values.

## Build ends with `spawn EPERM`

**Symptom:** `npm run build` compiles, then cannot start the TypeScript worker on Windows.

**Cause:** OS or sandbox child-process permission denial; it may be environmental.

**Solution:**

1. Run `npx tsc --noEmit` independently.
2. Close stale Node processes and retry from a normal permitted terminal.
3. Check antivirus/endpoint child-process restrictions.
4. Clear only the workspace `.next` directory when safe, then retry.
5. Do not claim a successful production build until exit code 0.

**Observed 2026-08-30:** Bundle compilation and direct TypeScript validation succeeded; worker spawn was denied afterward.

**Observed 2026-08-31:** Node's built-in test runner hit the same sandbox child-process denial. Running the focused suite in a permitted terminal passed; the production build also completed in the permitted environment. Treat an external pass as environment-specific evidence, not permission to bypass normal workstation controls.

**Observed 2026-09-02:** both admin-auth and content test commands hit `spawn EPERM` while starting their Node test workers in the restricted Windows sandbox. The same commands passed in the permitted environment (7/7 admin-auth and 14/14 content tests); repository-wide ESLint and standalone TypeScript also passed in the sandbox.

**Observed 2026-09-02 (dynamic catalog):** the restricted content suite and production build again hit the same child-process denial. Permitted reruns passed 16/16 content tests and completed the production build with TypeScript, 33/33 static pages, and exit code 0.

**Observed 2026-09-06 (complete storefront translations):** the restricted production build compiled successfully before its TypeScript worker hit `spawn EPERM`. The approved rerun completed TypeScript, generated 33/33 static pages, and exited 0; standalone TypeScript, full lint, and the 54-test direct single-process suite also passed.

## Development server crashes with `Fatal process out of memory: Zone`

**Symptom:** `pnpm dev` starts successfully, compiles routes such as `/product/[id]` and `/admin/categories`, then the Node/Next process terminates with exit code `3765269347` and a native `Fatal process out of memory: Zone` message.

**Cause observed 2026-09-02:** the Turbopack filesystem cache had grown to about 1,186.64 MiB in `.next`; `.next/dev` accounted for about 1,000.82 MiB and included individual SST cache files of about 243.50 MiB and 145.26 MiB. On this Windows machine that cache coincided with the previously observed paging-file/native-memory pressure. This is a bundler-process crash, not a Product/Category API response failure.

**Resolved:** the default `pnpm dev` script now runs `next dev --webpack`, which is an officially supported Next.js fallback. Stop every server for this workspace, remove only `D:\react-projects\E-com\e-com\.next`, then restart with `pnpm dev`. The directory is generated and will be recreated. `pnpm dev:turbopack` remains available only for deliberate reproduction/tracing.

**Prevention:** do not run Webpack and Turbopack development servers concurrently against the same output directory. If `.next/dev/cache/turbopack` grows abnormally and the crash returns, stop the server and clear only this workspace's `.next`; also keep the Windows system-managed paging file enabled. Do not delete the repository root, `storage/`, or source directories.

**Next 16 note:** development startup can auto-append a managed block to `AGENTS.md`. This repository sets `agentRules: false` because `AGENTS.md` is an existing project-owned working agreement. Keep that configuration unless automatic rule generation is intentionally adopted and reviewed.

## React says a component has not mounted yet, followed by `Array buffer allocation failed`

**Symptom:** the terminal forwards `Can't perform a React state update on a component that hasn't mounted yet`, then reports `RangeError: Array buffer allocation failed`, unhandled rejections, and a layout `ChunkLoadError` timeout. The overlay may highlight `<LanguageProvider>` in `RootLayout` even though that JSX line contains no state update.

**Cause observed 2026-09-02:** Windows commit usage was about 14,858.8 MiB against a 15,712.6 MiB limit while the Next child held about 1,279.3 MiB private memory. Native allocation failed while compiling/serving the layout chunk; the browser router's asynchronous failed-chunk recovery then produced the React development warning. The highlighted provider was the failed layout boundary, not proof of a render-time setter.

**Resolved:** `experimental.webpackMemoryOptimizations: true` and `experimental.preloadEntriesOnStart: false` reduce development memory pressure. `LanguageProvider` wraps only public `SiteChrome`, so admin routes do not mount its external-store subscription; the former Google Translate script/callback lifecycle has since been removed entirely. Stop all stale dev servers and restart `pnpm dev` after this configuration change.

**If it returns:** close memory-heavy browser tabs, VS Code windows, Adobe/Creative Cloud processes, or other development servers and keep a system-managed/larger Windows paging file. Then stop Next, clear only this repository's generated `.next`, and restart. A React `useEffect` rewrite cannot repair an OS-level array-buffer allocation failure by itself.

## Product detail reports duplicate React child keys

**Symptom:** opening `/product/[id]` shows `Encountered two children with the same key` and names a repeated Product feature line.

**Cause:** the highlights list previously used the feature text itself as its React key. Repeated feature values therefore produced identical sibling keys.

**Resolved 2026-09-03:** each rendered feature occurrence now has a unique text-and-position key, so previously stored duplicates render without a React warning. Product create/edit also removes exact duplicate feature lines before submission.

**Prevention:** do not use editable, non-unique display text alone as a React list key. Use a persisted item ID where the data model provides one, or add a deterministic occurrence discriminator for ordered scalar lists.

## Next.js reports missing smooth-scroll behavior metadata

**Symptom:** route navigation logs `Detected scroll-behavior: smooth on the <html> element` and asks for `data-scroll-behavior="smooth"`.

**Cause:** global CSS intentionally applies `scroll-behavior: smooth` to the HTML element, but the root layout did not declare that behavior for Next.js route-transition scroll management.

**Resolved 2026-09-03:** the root `<html>` element now includes `data-scroll-behavior="smooth"`. Smooth scrolling remains available normally, while Next.js can disable it temporarily when restoring scroll position during navigation.

**Prevention:** when applying smooth scrolling to the document root, keep the matching `data-scroll-behavior="smooth"` attribute on the root App Router layout.

## VS Code reports missing aliases in a moved admin file

**Symptom:** the Problems panel groups `Cannot find module` and follow-on implicit-`any` diagnostics under a former flat path such as `src/components/admin/AdminBlogForm.tsx`, even though the component was moved to `src/components/admin/blog/AdminBlogForm.tsx`.

**Cause:** VS Code retained the deleted file as an open editor buffer. Because that orphaned buffer is no longer part of the configured TypeScript project, its `@/` aliases can appear unresolved; the implicit-`any` messages are cascading diagnostics. The repository compiler does not report these errors.

**Solution:** close the tab for the deleted flat-path file, open the component from its new feature folder, and run **TypeScript: Restart TS Server** from the Command Palette. Use **Developer: Reload Window** if the deleted path still remains in Problems.

**Prevention:** after moving open TypeScript files, reopen them from the Explorer at the new path before continuing edits.

**Observed 2026-09-02:** the old file was absent on disk, the new Blog form imported `@/components/admin/blog/AdminRichTextEditor`, no stale source import remained, and `npx tsc --noEmit --pretty false` exited successfully with no diagnostics.

## Turbopack build fails with paging-file error 1455

**Symptom:** `npm run build` stops while restoring the `.next/cache/turbopack` database and reports that it cannot memory-map an SST cache file because the paging file is too small (`os error 1455`).

**Cause:** Windows cannot provide enough committed virtual memory for the cached Turbopack data. This is an environment/resource failure, not a TypeScript or ESLint diagnostic from the application.

**Solution:** close memory-heavy processes or increase the Windows paging-file allocation, then rerun the build. If the cache itself remains inconsistent after resources are available, stop all Next.js processes, remove only this workspace's `.next` directory, and rerun `npm run build` so the cache is regenerated.

**Prevention:** keep the system-managed paging file enabled and avoid running concurrent memory-heavy builds. Do not claim a successful production build unless the command exits with code 0.

**Observed 2026-09-01:** after unused-file/dependency cleanup, production compilation succeeded in 4.1 seconds before the same TypeScript-worker denial. Full lint, generated route types, standalone TypeScript, and the direct 7/7 admin-auth suite passed.

## Turbopack build exits with Windows code `3221225725`

**Symptom:** `pnpm build` stops during `Creating an optimized production build` without a source diagnostic and exits with decimal code `3221225725` (`0xC00000FD`).

**Cause:** the native Windows bundler process exhausted its stack or crashed transiently. Because no TypeScript/module diagnostic is emitted, this exit alone does not identify an application-code error.

**Solution:** rerun focused ESLint and `pnpm exec tsc --noEmit`, then make one clean build retry after the failed process has ended. If the exit repeats, stop other Next.js processes, inspect available memory/paging resources, and clear only this workspace's `.next` cache when safe. Do not claim build success without a later exit code 0.

**Observed 2026-09-03:** the first permitted Team-module build exited with `3221225725` during native compilation. An unchanged immediate retry compiled in 7.2 seconds, completed TypeScript in 16.6 seconds, generated 35/35 static pages, listed the Team pages/APIs, and exited 0; the failure was transient.

## Build cannot fetch configured Google Fonts

**Symptom:** `npm run build` reports `next/font` failures for Fraunces and Inter because it cannot connect to `fonts.googleapis.com`.

**Cause:** the build environment has restricted or unavailable outbound network access. The application source and TypeScript compilation may still be valid, but `next/font/google` downloads the configured font assets during production compilation.

**Solution:** run the build in the approved deployment or workstation environment with outbound HTTPS access to Google Fonts, or make a separately reviewed change to self-host the fonts with `next/font/local`. Do not disable TLS verification.

**Observed 2026-09-01:** the restricted build failed only at the existing Google Font fetches; the permitted `npm run build` rerun compiled, type-checked, generated all pages, and exited 0.

**Observed 2026-09-03:** the first Webpack verification build reached the existing Fraunces/Inter download and failed with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. A retry with `NODE_USE_SYSTEM_CA=1` preserved TLS verification, compiled successfully, completed TypeScript, generated 30/30 static pages, emitted the full route manifest, and exited 0.

## pnpm registry reports `UNABLE_TO_VERIFY_LEAF_SIGNATURE`

**Symptom:** a dependency install retries registry metadata requests and then fails with `ERR_PNPM_META_FETCH_FAIL` plus `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, even though TLS verification is enabled.

**Cause:** Node's bundled CA set does not include a certificate chain that the Windows machine already trusts in its system certificate store.

**Resolved 2026-09-01:** on Node 22, run the scoped dependency command with `NODE_USE_SYSTEM_CA=1` (PowerShell: `$env:NODE_USE_SYSTEM_CA='1'`) so Node adds the operating system's trusted CA store while keeping TLS verification enabled. The Tiptap install then completed and pnpm's lockfile supply-chain policy check passed.

**Observed 2026-09-06:** the Prettier dependency install emitted the same certificate warnings while retrying registry metadata. pnpm retained TLS verification, reused its verified package store, passed the lockfile supply-chain policy, added the two exact development dependencies, and exited 0. No insecure TLS override was used.

**Prevention:** keep `strict-ssl` enabled. Configure the organization/root certificate through the system store or an approved `NODE_EXTRA_CA_CERTS` file; never solve this by disabling certificate verification.

## `pnpm list` cannot open its SQLite database

**Symptom:** `pnpm list` reports `ERR_SQLITE_ERROR: unable to open database file` in a restricted workspace shell even though installed packages resolve during lint and TypeScript checks.

**Cause:** pnpm's package-list diagnostic opens its store index outside the writable workspace, and the restricted shell cannot access that database. This does not by itself indicate a corrupt application lockfile or missing dependency.

**Resolved 2026-09-01:** rerun the read-only `pnpm list ... --depth 0` command in a permitted terminal. It confirmed the three installed Tiptap packages at 3.30.5. Do not edit or delete the store database manually.

## TypeScript references deleted App Router routes

**Symptom:** `npx tsc --noEmit` reports missing page or route modules under `.next/types/validator.ts`, even though those routes are absent from `src/app/`.

**Cause:** `.next` contains stale generated route types from an earlier source tree.

**Solution:** Run `npx next typegen`, then rerun `npx tsc --noEmit`. If generation itself remains stale, stop the development server and remove only the workspace `.next` directory before regenerating; never delete a broader directory.

**Observed 2026-08-31:** stale `/admin/cms` generated references caused the failure; `npx next typegen` refreshed the route graph and TypeScript then passed.

## Node strip-only tests reject a TypeScript parameter property

**Symptom:** a `node --experimental-strip-types` test fails with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` and points to a constructor parameter such as `readonly status`.

**Cause:** Node's strip-only TypeScript loader removes erasable types but does not transform parameter properties because they require emitted JavaScript assignments.

**Resolved 2026-09-01:** declare the class property normally and assign it inside the constructor. This preserves runtime behavior and lets the focused Node test runner import the module without a transpilation step.

**Prevention:** files imported directly by the repository's strip-only test scripts must use erasable TypeScript syntax; avoid enums, namespaces, and constructor parameter properties in that import graph.

## Node strip-only tests cannot resolve an `@/` alias from a newly imported module

**Symptom:** `pnpm test:content` fails before running tests with `ERR_MODULE_NOT_FOUND: Cannot find package '@/data'`, after a test directly imports a repository module that itself uses Next.js path aliases.

**Cause:** Node's direct `--experimental-strip-types` runner strips TypeScript syntax but does not apply the Next.js bundler's `@/` resolution to the newly exposed import graph.

**Resolved 2026-09-02:** moved the catalog initialization predicate into dependency-free `src/lib/catalogMigration.ts` and imported that helper by a relative path from the test. The repository continues to consume it through the normal `@/lib/...` application alias, while the focused suite passed 17/17.

**Prevention:** keep utilities tested by the direct Node runner dependency-free or ensure every dependency in that test import graph uses Node-resolvable specifiers. Do not pull a route/repository graph into a unit test only to reach one pure predicate.

## TypeScript rejects a legacy catalog record passed to the migration helper

**Symptom:** `npx tsc --noEmit` reports `TS2345` because `Record<string, unknown>` is not assignable to a type requiring `catalogInitialized`, `products`, and `categories` properties.

**Cause:** legacy JSON is deliberately allowed to omit all three catalog keys, but the first helper signature used `Pick<Record<...>>`, which incorrectly made every selected key required.

**Resolved 2026-09-02:** the predicate now accepts a `Partial<Record<...>>` for those three known keys and continues narrowing each array at runtime. TypeScript and focused ESLint passed afterward.

**Prevention:** migration helpers must model the oldest accepted persisted shape, including absent keys; validate/narrow unknown JSON inside the helper instead of asserting the current schema prematurely.

## External images fail

**Symptom:** `next/image` says a hostname is not configured.

**Cause:** Host absent from `images.remotePatterns`.

**Solution:** Prefer local assets. Otherwise add the narrowest trusted host/protocol rule, restart, and document the dependency/security impact.

**Windows runtime variant observed 2026-09-05:** the configured UploadThing asset returned HTTP 200 directly, but `/_next/image` returned HTTP 500 because the local Node process did not inherit the trusted system CA chain. Start the local production server with PowerShell `$env:NODE_OPTIONS='--use-system-ca'; pnpm start`, or configure the approved CA through `NODE_EXTRA_CA_CERTS`. With the system CA enabled, the same optimized image returned HTTP 200. Do not disable TLS verification; production hosts must provide a valid trusted CA configuration.

## Contact form does not send

**Likely causes:** missing/invalid server-only `RESEND_API_KEY`, unverified `gtbsbooks.com`, Resend quota/provider failure, mismatched request origin, PostgreSQL unavailability for throttling, or three requests from the same client within 15 minutes.

**Solution:** verify the Vercel secret, domain status, Resend delivery log, matching `NEXT_PUBLIC_SITE_URL`, Supabase connectivity, and any `Retry-After` response. The sender is fixed to `support@gtbsbooks.com`; never expose the Resend key to browser code.

**Prevention:** retain strict body validation, honeypot, explicit same-origin marker, atomic PostgreSQL limits, controlled errors, and server-side delivery.

## Admin image upload says UploadThing is not configured

**Symptom:** the protected upload API returns HTTP 503.

**Cause:** `UPLOADTHING_TOKEN` is absent or empty in the server environment.

**Solution:** Create/copy the token from the UploadThing application into the deployment secret manager as `UPLOADTHING_TOKEN`, restart the server, and retry. Never use a `NEXT_PUBLIC_` prefix or paste the token into source/docs.

## Successful upload prints deprecated `file.url` and `file.appUrl` warnings

**Symptom:** `POST /api/admin/content/upload` returns 201 and the image works, but the server prints two UploadThing deprecation warnings—often twice—telling callers to use `file.ufsUrl`.

**Cause discovered 2026-09-06:** application code already maps only `result.data.ufsUrl`. Latest published stable `uploadthing@7.7.4` constructs its server `UTApi.uploadFiles` response by internally reading `response.url` and `response.appUrl`; those properties are warning getters. The warning therefore originates inside the dependency rather than Admin form/API code.

**Resolved 2026-09-06:** pnpm applies `patches/uploadthing@7.7.4.patch` to both ESM and CommonJS server builds, deriving legacy compatibility fields from `response.ufsUrl` without invoking the deprecated getters. Run `pnpm install`, fully restart Next.js, and retry. A real upload returned a canonical `ufs.sh` URL with no warnings; provider cleanup was requested afterward.

**Prevention:** keep application mapping on `ufsUrl`, keep the pnpm patch registered/checksum-tracked, and review/remove it when upgrading UploadThing to a version with the upstream correction. Do not edit installed `node_modules` manually and do not hide all dependency warnings globally.

## Admin image is rejected before upload

**Symptom:** the form or API reports that an image is invalid or larger than 500 KB.

**Cause:** the file exceeds 500 KiB, is not JPG/PNG/WebP, has a mismatched binary signature, or a gallery selection exceeds 12 extra photos.

**Solution:** resize/compress and export the image as JPG, PNG, or WebP. For gallery albums, keep no more than 12 extra photos; the cover is uploaded separately.

**UI behavior:** client-side validation identifies the file and displays the message directly below the affected Blog banner, Gallery cover, or Gallery extra-photo input. General provider/API failures may still appear as a form error and toast.

**Gallery preview behavior:** a valid extra photo appears immediately with a `New` badge before submission. This confirms local selection only; UploadThing upload begins after Create/Update is pressed. If no preview appears, first resolve the inline size/type/count error.

## Gallery pending preview shows a broken image

**Symptom:** the pending card and `New` badge appear, but the selected image is replaced by its alt text.

**Cause:** the browser received an admin Content Security Policy whose `img-src` directive did not allow the local `blob:` URL used for the pre-upload preview.

**Resolved 2026-09-01:** the admin-only `img-src` directive now permits `blob:`. Restart the Next.js server after pulling the configuration change, then hard-refresh the admin form so the response contains the updated CSP header.

## Gallery lightbox arrow keys do nothing

**Symptom:** the lightbox arrow buttons work, but pressing the keyboard Left Arrow, Right Arrow, or Escape has no effect.

**Cause:** the viewer implemented pointer handlers but did not register a keyboard listener while open.

**Resolved 2026-09-01:** the lightbox now registers a temporary document keydown listener while open. Left/Right navigate only currently revealed photos, Escape closes the viewer, and cleanup removes the listener on close.

## Gallery detail URL shows a numeric ID

**Symptom:** a detail page opens at an address such as `/gallery/1` instead of a readable title-based URL.

**Cause:** Gallery cards and related links previously interpolated the record ID even though every album already has a validated slug.

**Resolved 2026-09-01:** all generated Gallery links and SEO outputs use the stored slug. Existing numeric URLs redirect to the canonical slug URL; restart/refresh the application if an old client bundle still generates numeric links.

## Live API smoke test fails or leaves temporary records

**Symptom:** `pnpm test:api` cannot log in/connect, reports an unexpected endpoint status, or is interrupted before deleting an `API Smoke` record/provider image.

**Cause:** the application is not running at `API_SMOKE_BASE_URL` (default `http://localhost:3000`), `API_SMOKE_ADMIN_PASSWORD` differs from the database credential, an integration is unavailable, a database auth/email limit is active, or execution stopped during cleanup.

**Solution:** start/restart the app with the same environment, provide the controlled smoke password only to the local command, confirm the reviewed target URL/database, and rerun. Content/provider records use unique suffixes and clean themselves. `API_SMOKE_EPHEMERAL_ADMIN=true` additionally consumes a valid reset token and changes that identity's password, so use it only with a temporary account that the harness deletes—not the real Admin. Never point destructive smoke mode at production or bulk-delete tables for cleanup.

**Development diagnostics resolved 2026-09-06:** the first typed smoke runner constrained every response projection to include `id`, so TypeScript rejected valid update assertions that selected only `price`, `location`, `rating`, or `role` (`TS2344`). The response helper now accepts the operation-specific item shape. During the Better Auth migration, one controlled run reached an already-running pre-migration development process and obtained a session for the wrong configured identity, so CRUD correctly returned 401; stop every old workspace server before testing environment/auth changes.

**Prevention:** use a controlled environment, leave the process running through its final cleanup/logout messages, and do not point `API_SMOKE_BASE_URL` at production without explicit approval.

## Better Auth reports `Drizzle schema mismatch` for `authAccount.issuer`

**Symptom observed 2026-09-06:** Better Auth 1.7.3 startup reports that required column `authAccount.issuer` is never written and credential inserts will fail.

**Cause:** the short-lived 1.7.2 account schema required `issuer`; 1.7.3 removed that write contract. Keeping the non-null 1.7.2 field while running 1.7.3 makes the adapter correctly fail its schema safety check.

**Resolved 2026-09-06:** `003_align_better_auth_1_7_3.sql` removes the 1.7.2 constraint/column and the Drizzle schema matches pinned `better-auth@1.7.3`. Loading the final auth config emitted no mismatch.

**Prevention:** pin Better Auth and its Drizzle adapter to the same version, inspect release migrations, and add a new numbered migration rather than editing an applied file.

## Better Auth bootstrap fails with null `auth_user.id`

**Symptom observed 2026-09-06:** first signup attempts insert `default` for `auth_user.id`, violating the primary-key not-null constraint.

**Cause:** configuring `advanced.database.generateId: "uuid"` delegates UUID generation to a database default, but the schema intentionally uses text IDs without such a default.

**Resolved 2026-09-06:** removed that override so Better Auth generates its standard ID before insert. The Admin account then bootstrapped successfully. The permanent `pnpm admin:setup` path also generates explicit UUID text IDs transactionally.

**Prevention:** keep Better Auth ID-generation options aligned with actual Drizzle/SQL defaults and exercise a real credential insert after schema changes.

## PostgreSQL setup fails or the tables stay empty

**Symptom:** `pnpm db:setup` reports a missing/invalid `DATABASE_URL`, cannot connect, reports that an applied migration was modified, or leaves content tables empty.

**Cause:** setup requires a valid server-only PostgreSQL URL with reachable network/TLS settings. Password URL characters must be percent-encoded, and applied migration checksums are intentionally immutable. Migration-only runs (`pnpm db:migrate`) create tables but do not seed them. The one-time seed intentionally skips when `gtbs_settings` already contains `content_initialized`.

**Solution:** copy the PostgreSQL connection URL into local/deployment `DATABASE_URL` without a `NEXT_PUBLIC_` prefix, use the provider's SSL-enabled direct URL for controlled migrations and Supabase's TLS transaction-pooler URL on Vercel, and ensure the database allows the current network. If checksum verification fails, restore the applied SQL file and create a new numbered migration. Do not delete migration/initialization records merely to bypass safety checks. Run `pnpm db:setup`; fresh initialization uses committed seeds only. If initialization is marked complete but data is unexpectedly absent, investigate/restore the intended database instead of automatically reseeding and potentially undoing legitimate deletions.

**Prevention:** keep credentials out of Git/logs, keep applied migration files immutable, and confirm the target database before setup. The command sanitizes the exact configured URL from surfaced errors but provider host/account details may still be operationally sensitive.

### `sslmode=require` reports a self-signed certificate chain

**Symptom observed 2026-09-06:** after explicitly enabling TLS, `pg@8` warned that its current `require` behavior aliases `verify-full`, then a direct Supabase connection failed with `self-signed certificate in certificate chain`.

**Cause:** current `pg-connection-string` certificate-verification semantics differ from standard libpq `require`, and the local trust store did not contain Supabase's CA.

**Resolved 2026-09-06:** the local URL explicitly uses `sslmode=require&uselibpqcompat=true`, preserving encrypted libpq-compatible `require` behavior without relying on a version-dependent alias. Production code rejects PostgreSQL URLs with no TLS mode. Prefer `sslmode=verify-full` with the Supabase dashboard CA installed in an approved trust store when that deployment facility is available; never use `sslmode=disable`, `rejectUnauthorized=false`, `NODE_TLS_REJECT_UNAUTHORIZED=0`, or print the connection URL while debugging.

### Supabase pooler reports `(ENOTFOUND) tenant/user ... not found`

**Symptom observed 2026-09-06:** migration/build queries fail before SQL execution with a pooler tenant/user lookup error.

**Cause:** the transaction-pooler username is malformed—commonly because only fragments of a rotated credential were replaced. A Supabase shared-pooler username is `postgres.<project-ref>`; it is not the database password.

**Solution:** copy the complete Transaction pooler URI from Supabase Dashboard → Connect, substitute the newly rotated password only in its password field, retain port `6543`, URL-encode reserved password characters, and append the documented TLS parameters. Validate with `pnpm db:migrate` without logging the URI.

## Staging appears indexable

**Symptom:** `staging.gtbsbooks.com` lacks the search-exclusion header, advertises a sitemap, or emits indexable metadata.

**Cause:** the domain is not attached to a Vercel Preview build, `VERCEL_ENV` was overridden, or a Preview deployment was promoted without a Production rebuild.

**Solution:** keep `VERCEL_ENV` provider-owned, assign the domain specifically to the `staging` Preview branch, redeploy that branch, and verify `curl -I https://staging.gtbsbooks.com/` contains `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex`; `curl https://staging.gtbsbooks.com/robots.txt` must contain `Disallow: /`, and rendered HTML must contain noindex robots metadata. Remove any already indexed staging URL through the relevant search-console removal tool after directives are live.

## Vercel build warns that it detected an uploaded `.env`

**Symptom observed 2026-09-06:** the first successful CLI Production build warned that a source `.env` file was present even though Git ignored it.

**Cause:** Vercel CLI source-file selection is separate from Git's index; `.gitignore` did not provide an explicit CLI upload boundary.

**Resolved 2026-09-06:** committed `.vercelignore` excludes `.env`, every `.env.*` variant, `.vercel/`, `.git/`, `.next/`, and dependencies. Redeploy and require the warning to be absent. Environment values remain configured through Vercel's scoped Secret/Config store; never depend on an uploaded local file.

## Unexpected Git branch triggers a Vercel build

**Cause:** unspecified `git.deploymentEnabled` branches default to enabled, or project settings override the repository topology.

**Solution:** retain the deny-all `"*": false` rule plus explicit `main`/`staging` allowances in `vercel.json`, keep `main` configured as Vercel's Production Branch, and use a branch domain tied only to `staging`.

## Blog/gallery changes disappear after deployment

**Symptom:** content resets, disappears after restart/redeploy, or differs between environments.

**Cause:** the environment is connected to a different/uninitialized PostgreSQL database, or a deployment has a missing/incorrect `DATABASE_URL`.

**Resolved 2026-09-06:** all public/Admin content reads and CRUD operations use the shared Drizzle PostgreSQL repository, and all legacy content/credential filesystem code and files have been removed. Configure the same intended server-only database connection in each deployment, run `pnpm db:setup` once, and verify its initialization marker/content counts.

## Admin sidebar disappears on Blog or Gallery

**Symptom:** selecting Blog or Gallery appears to leave the dashboard shell, and the page opens directly on an editor instead of a content list.

**Cause:** the content routes previously used a separate top-navigation shell and rendered the editor beside content cards rather than using the dashboard navigation and a list-first CRUD flow.

**Resolved 2026-09-01:** both content routes now use the shared dashboard-style `AdminContentShell`. Desktop keeps a sticky sidebar, mobile keeps a compact admin route bar, and each index route defaults to a responsive table with Add, View, Edit, and Delete controls. Add and Edit navigate to dedicated protected form routes.

**Prevention:** route new admin content modules through the common admin shell, make the index route a list view, and place create/edit UI on dedicated protected routes reached only from explicit actions.

## pnpm blocks msgpackr-extract during UploadThing installation

**Symptom:** pnpm reports `ERR_PNPM_IGNORED_BUILDS` for `msgpackr-extract`.

**Cause:** an optional native optimization requested a build script under pnpm's supply-chain policy.

**Solution:** keep `msgpackr-extract: false` in `pnpm-workspace.yaml`; the JavaScript fallback is sufficient for this application. Re-run pnpm using the repository's established store.

## Inline `tsx -e` database check rejects top-level await

**Symptom:** an ad hoc `pnpm exec tsx --env-file=.env -e '...'` check fails with `Top-level await is currently not supported with the "cjs" output format` before querying PostgreSQL.

**Cause:** `tsx -e` compiles inline evaluation as CommonJS in this invocation, where top-level await is unavailable.

**Resolved 2026-09-06:** wrap the inline asynchronous statements in `void (async () => { ... })();`, or put the check in a normal TypeScript module. This is a verification-command format issue, not a Drizzle/database failure.

## Clean-clone TypeScript check cannot resolve imported WebP files

**Symptom:** `pnpm exec tsc --noEmit` reports `TS2307` for committed image imports even though the files exist under `public/images/`.

**Cause:** the ignored/generated Next.js declaration files have not been created in the fresh checkout, so TypeScript does not yet have Next's static-image module declarations.

**Solution:** run `pnpm exec next typegen`, then rerun `pnpm exec tsc --noEmit`. This creates only ignored framework output; do not add ad hoc declarations for each image.

## Stale UI after changes

Restart for environment changes. For stale generated output, stop the process and remove only the workspace `.next` directory, then restart. Never recursively delete a broad directory or workspace root.

## Production build cannot download Google fonts

**Symptom:** `next build` fails while resolving a `next/font/google` family even though application code compiled locally.

**Cause resolved 2026-09-05:** the root layout made the build depend on an external Google Fonts request, which is unavailable in restricted/offline deployment builders.

**Solution:** the storefront now uses local system sans/serif font stacks in `globals.css`; the root layout no longer imports remote font loaders. This removes the font request from the critical path and lets an offline builder compile the layout.

**Prevention:** if custom typography returns, self-host reviewed font files and preload only the required subsets/weights.

## Seed Product images return 404

**Symptom:** a first-run catalog card requests a missing file under `/images/products/` and renders broken alt text.

**Cause resolved 2026-09-05:** five seed records referenced cover files that were not committed to `public/images`.

**Solution:** missing seed covers now use the committed code-native `book-placeholder.svg`. The site-integrity suite checks literal public image references before release.

**Prevention:** run `pnpm test:site` whenever static asset paths or internal links change.

## Catalog heading is absent from initial HTML

**Symptom:** `/allproducts` looks correct after hydration but its first response has no `<h1>`, weakening non-JavaScript accessibility and SEO inspection.

**Cause resolved 2026-09-05:** `useSearchParams` lived below a Suspense boundary whose route fallback was the only initial server output.

**Solution:** the route Server Component now awaits `searchParams` and passes normalized initial filter values to the interactive catalog component. The heading and catalog content are rendered in the response.

**Prevention:** keep URL parsing in the Server Component when the same values define initial server-rendered content.

## Dependency audit cannot reach the registry on Windows

**Symptom:** `pnpm audit --prod` retries the npm advisory endpoint with TLS or connection errors in the restricted shell.

**Cause:** the environment either blocks registry network access or Node does not inherit the organization/system CA chain.

**Resolved 2026-09-05:** run the audit from a permitted terminal with Node's system CA enabled, for example PowerShell `$env:NODE_OPTIONS='--use-system-ca'; pnpm audit --prod`. Keep TLS verification enabled. The verified run reported no known vulnerabilities.

**Prevention:** give the CI audit explicit registry access and the approved CA configuration; never use `strict-ssl=false` or `NODE_TLS_REJECT_UNAUTHORIZED=0`.

## Node test scripts hit `spawn EPERM`

**Symptom:** a package test command starts Node's test runner but Windows denies its isolated child process.

**Cause:** the restricted environment blocks the default per-file test subprocess, matching the build-worker limitation documented above.

**Workaround verified 2026-09-05:** run the same TypeScript tests in one process with `node --experimental-strip-types --test --experimental-test-isolation=none tests/admin-auth.test.ts tests/content-management.test.ts tests/site-integrity.test.ts`. This passed all 32 tests; still keep the normal package scripts for unrestricted CI.

## pnpm reports an unexpected store location

**Symptom:** a dependency command reports `ERR_PNPM_UNEXPECTED_STORE` because `node_modules` is linked to a different pnpm store.

**Cause:** the active pnpm configuration selects a workspace-local store while the existing installation was linked from another known store location.

**Resolved 2026-09-01:** the cleanup reused the existing `D:\.pnpm-store\v11` location explicitly to update the manifest, lockfile, and installed graph. The failed first attempt's generated workspace `.pnpm-store/` cache was removed afterward.

**Prevention:** keep pnpm version/store configuration consistent for the workspace. If dependencies were intentionally moved to a different store, run a normal `pnpm install` instead of manually editing files inside `node_modules` or the store.
