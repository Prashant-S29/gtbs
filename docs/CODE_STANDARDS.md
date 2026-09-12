# Code Standards

## TypeScript

- Keep strict mode passing.
- Prefer domain types over `any`; use `unknown` with narrowing.
- Use `import type` for type-only imports.
- Put shared domain models in `src/types/`.
- Prefer immutable transforms to mutating shared values.
- Use the `@/` alias for imports rooted at `src/`.

## React and Next.js

- Use Server Components by default.
- Add `"use client"` at the smallest interactive boundary.
- Use `suppressHydrationWarning` only on the exact element where reviewed browser/extension-owned attributes can differ. Do not use it to hide application-owned text, structure, locale, date, or random-value mismatches.
- Keep route metadata in pages/layouts or shared SEO helpers.
- Use route handlers for server HTTP behavior.
- Keep persistence behind typed repository functions; do not read or write runtime content files from pages/components.
- Keep dependency hotfixes as minimal package-manager patches under `patches/`, cover the changed invariant, document why the latest upstream release still needs the patch, and review/remove the patch during upgrades. Never rely on direct edits inside `node_modules`.
- Keep PostgreSQL changes in ordered `database/migrations/*.sql` files. Never edit an applied migration; add a new migration and let `pnpm db:setup` verify checksums and apply it transactionally.
- Database setup/runtime code must use the server-only `DATABASE_URL`, avoid logging connection details, remain provider-neutral, and keep tables browser-inaccessible by default. One-time seeds must use an initialization marker rather than refilling an intentionally emptied table.
- For repository-backed index pages, load initial data in the route Server Component and pass it to the smallest interactive Client Component. Do not delay first content behind a mount-time fetch when the server already owns the data source.
- Runtime content must be queried through the Drizzle repository. Keep returned JSONB validation at the persistence boundary and use PostgreSQL transactions plus database constraints/advisory locks for multi-step or cross-record mutations.
- Treat Product IDs and Category/Blog/Gallery slugs as backend-owned normalized lowercase route keys. Create them through the shared collision-safe repository helper, retain them on update, never accept them from Admin mutation payloads, and validate Product-to-Category relationships again inside repository mutations, not only in forms.
- Do not synchronously mirror state in effects; derive or initialize it when possible.
- Every delayed callback, subscription, or asynchronous browser integration created in an effect must be cancelled, deactivated, or detached in that effect's cleanup before its component can unmount.
- Never access `ref.current` during render.
- Reset filtered pagination in the filter/search event handler instead of calling a state setter from an effect.
- Prefer native overflow and CSS scroll snap for simple carousels; keep imperative scrolling in event handlers and avoid autoplay unless product requirements justify it.
- Cached public repository routes must declare a deliberate revalidation window, and every successful admin content mutation must invalidate the affected storefront cache.
- Prefer semantic HTML over generic containers.
- Keep rich-text documents as typed/validated JSON. Render allow-listed nodes and marks as React elements; do not pass editor HTML directly to `dangerouslySetInnerHTML`.
- Keep third-party translation in a server-only typed service. Client components call a protected same-origin Admin route, treat provider output as an editable suggestion, and never read provider credentials.

## Components

- Components use PascalCase; hooks start with `use`; utilities use camelCase.
- Feature components live in their domain; generic primitives live in `ui` or `common`.
- Group admin feature components under `src/components/admin/<feature>/`; keep only genuinely cross-feature admin components at `src/components/admin/`.
- Pages focus on composition, loading, authorization, and route concerns.
- Put route chrome that must survive navigation in the nearest shared Next.js layout. Admin pages must not recreate the sidebar/header; they compose page headings/content through `AdminContentShell`, while `AdminPanelShell` owns pathname-based navigation state.
- Flexible Product specifications and variants use typed arrays of bounded objects, not unvalidated arbitrary records. Specifications may use a local `{ name, values[] }` draft solely to provide the grouped editor, but must flatten to the canonical `{ name, value }` domain type before submission. Render specification values, variant options, and Product features as individual controlled inputs with accessible add/delete controls; do not parse them from a multiline textarea. Client forms identify partial groups, trim/drop wholly blank entries, and collapse duplicate variant option/feature text before sending; strict server schemas remain authoritative.
- Category mutations use the shared bilingual step contract: keep both names mounted/preserved, validate English before advancing, submit only from Gujarati, and keep the stored localized block optional solely for legacy compatibility.
- Reuse `AdminGujaratiSuggestion` directly below bilingual fields. Automatic English suggestions may run when a nonblank untranslated Gujarati field first appears; phonetic generation remains explicit. Cache identical suggestions only as a bounded client usability optimization, never as persistence or authorization state.
- In narrow Admin form cards, stack paired actions on mobile and assign secondary actions a compact fixed desktop width; keep primary submit labels/icons non-shrinking and non-wrapping.
- Product and Gallery multi-image forms store pending `File` objects separately from persisted image records, revoke every object URL on removal/unmount, and never treat a local preview as proof of provider upload.
- Extract repeated/stateful dashboard behavior before adding more admin modules.
- Dashboard metrics must be derived from typed repository data; never ship illustrative counts or charts as though they were operational data.
- Avoid abstractions that do not clarify reuse, domain, or server/client boundaries.
- Avoid one-use components that only forward fixed props into a shared component; compose the shared component at the page or feature boundary unless the wrapper owns meaningful behavior or domain semantics.
- Export only declarations consumed outside their module. Keep implementation-only props, helper types, constants, and schemas module-private.
- Build every Product/Card/Cart WhatsApp sale URL through `src/lib/whatsappOrder.ts`; do not duplicate greeting, quantity, variant, price, or Product-link formatting inside components.

## Styling

- Prefer Tailwind utilities and existing visual conventions.
- Start mobile-first, then add responsive enhancements.
- Storefront static copy uses typed semantic dictionary keys through `useLanguage().t`; Server Components that only need a translated text leaf may use `StorefrontText`, while larger interactive blocks remain focused client boundaries. Keep keys inside the closest nested feature section (`home.hero`, `catalog`, `contact.form`, `faqContent`, `policies`, and so on), and add the same leaf path to both `english.json` and `gujarati.json` in one change. Interpolation placeholders use named braces such as `{count}` and must match in both language files. Static FAQ records store typed question/answer keys, never a second embedded copy of either language.
- When Gujarati font metrics change a layout materially, keep the React-owned markup stable and use narrowly scoped `html[lang]` presentation rules with explicit flex/grid gaps. Do not introduce external scripts that rewrite React-owned text nodes.
- Use arbitrary values sparingly.
- Maintain keyboard focus, contrast, and 40–44px touch targets. When a feature removes the global orange input outline, use a dedicated scoped class that overrides the unlayered global `:focus-visible` rule and replace it with a visible neutral focus state rather than removing keyboard focus indication entirely.
- Specify image dimensions to prevent layout shift. Every responsive `next/image` using `fill` must also declare a realistic `sizes` value.
- Reserve `priority`/high fetch priority for above-the-fold LCP candidates; lazy-load content below the fold.
- Provide a reduced-motion fallback for nonessential animation and scrolling.

## Forms and accessibility

- Inputs need labels or accessible names.
- Associate clear validation errors with fields.
- Buttons declare `type`.
- Icon-only controls require `aria-label`.
- Rich-text toolbar controls require `type="button"`, accessible labels, visible active/disabled states, and mobile wrapping.
- Use `aria-current` for active navigation and semantic async status text.
- Dialogs and lightboxes need a programmatic name, Escape behavior, focus management/return, and background scroll restoration.
- Public pages expose a keyboard skip link to the primary content region.

## Deployment source boundaries

- Git ignore rules and Vercel CLI upload rules are separate. Keep `.env`, `.env.*`, `.vercel/`, generated output, and dependencies excluded through `.vercelignore`; a successful CLI build must not report that it detected an uploaded `.env` file.
- Keep branch auto-deployment policy in the committed `vercel.json`; domain-to-branch and production-branch assignments remain provider configuration.

## Errors

- Never expose stack traces, credentials, or internal config to users.
- Make user errors actionable.
- Do not log passwords, session cookies, or private form content.
- Invalid input returns controlled 4xx; missing server config returns 5xx/503.
- Authentication failures use generic messages; rate-limit responses include `Retry-After` without revealing whether an account exists.

## Authentication

- Delegate credential parsing, hashing, reset-token generation/consumption, session cookies, origin controls, and auth endpoint contracts to Better Auth rather than recreating them in route handlers.
- Validate image MIME type, byte size, and file signature server-side before provider upload; client checks are usability only. Map UploadThing results from canonical `ufsUrl`, never deprecated `url`/`appUrl` getters.
- Keep Better Auth and Resend configuration in `server-only` modules. Client components use the Better Auth client or same-origin application routes and never read provider/database secrets.
- Keep Better Auth users, credential accounts, sessions, verifications, and auth rate limits in PostgreSQL. Never introduce filesystem/process-local auth correctness state.
- Password recovery uses generic discovery responses, one-hour single-use Better Auth tokens, PostgreSQL session revocation, and fixed-domain server-side Resend delivery.
- Public email routes use strict Zod schemas, small body caps, a honeypot, same-origin marker checks, and atomic PostgreSQL rate limits before Resend calls.
- Admin mutation fetches include `X-GTBS-Admin-Request: 1`; route handlers also validate Origin and fetch-site metadata.
- Production cookies are Better Auth-managed Secure and HttpOnly cookies. Every protected server boundary performs a live database session/identity check.
- Add auth regression coverage to `tests/admin-auth.test.ts` whenever an authentication invariant changes.

## Formatting

- Use the repository-local Prettier version; do not rely on an editor-global or transiently downloaded formatter.
- Run `pnpm format` to format supported repository files and `pnpm format:check` for a read-only formatting check.
- Keep generated output, runtime persistence, TypeScript build metadata, and `pnpm-lock.yaml` in `.prettierignore`. The lockfile remains package-manager generated.
- Keep `eslint-config-prettier/flat` last in the ESLint configuration so lint rules do not compete with Prettier's formatting decisions.
- Formatting must not be mixed with intentional behavior changes unless those behavior changes are independently documented and verified.

## Verification

On this Windows workspace, use `pnpm dev` for the stable Webpack development server. Use `pnpm dev:turbopack` only when intentionally reproducing or tracing Turbopack behavior; stop the server before switching bundlers and clear only this workspace's generated `.next` directory if their caches conflict.

For changed files:

```bash
pnpm format:check
npx eslint path/to/changed-file.tsx
npx tsc --noEmit
npm run test:admin-auth
npm run test:content
npm run test:site
```

For live API/CRUD integration, start the app against a controlled database and provider account, then run `pnpm test:api`. The suite temporarily creates, updates, and deletes all six content domains and uploads/deletes one provider image; do not interrupt it during cleanup.

For releases or routing/config changes:

```bash
pnpm lint
pnpm audit --prod
pnpm build
VERCEL_ENV=preview pnpm build
# Start the preview build and verify / plus /robots.txt:
curl -I http://localhost:3000/
curl http://localhost:3000/robots.txt
```

The Preview response must include the full `X-Robots-Tag` exclusion and its robots file must disallow `/`. Keep branch selection in `vercel.json`; keep branch-domain and production-branch assignment in Vercel project settings.

If full checks fail because of existing debt or an environment limitation, run focused checks and record both outcomes in `PROGRESS.md` and `TROUBLESHOOTING.md`. A focused pass is not a repository-wide pass.
