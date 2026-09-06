# Security

This records implemented controls and known risks; it is not a formal security certification.

## Secrets

- Real values belong in local/deployment secret configuration, never source or Markdown.
- `.env.example` contains placeholders only.
- Admin passwords/hashes are Better Auth credential records in PostgreSQL. They are never deployment environment values or files; `pnpm admin:setup` reads the initial password only from a hidden interactive terminal.
- `BETTER_AUTH_SECRET` must be stable across deployments and contain at least 32 random characters.
- Production requires matching credential-free HTTPS `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` origins; Admin auth fails closed otherwise.
- `NEXT_PUBLIC_` variables are browser-visible and cannot contain secrets.
- `RESEND_API_KEY` is server-only and send-scoped to the verified `gtbsbooks.com` domain. Sender identity is fixed in server code to `GTBS Support <support@gtbsbooks.com>`.
- `UPLOADTHING_TOKEN` is server-only and must never be prefixed with `NEXT_PUBLIC_` or returned by an API.
- `DATABASE_URL` contains database credentials. Keep it server-only, require TLS for hosted PostgreSQL, never print it, and never prefix it with `NEXT_PUBLIC_`. The deployable baseline uses explicit libpq-compatible `sslmode=require`; prefer `verify-full` with Supabase's CA in the deployment trust store when available.
- Rotate a secret immediately if exposed in Git, logs, screenshots, chat, or docs.

## Dependency baseline

- Next.js and `eslint-config-next` are pinned to 16.3.3, which contains the upstream fixes for the August 2026 unauthenticated RCE advisories affecting earlier 16.x releases.
- UploadThing currently permits an older transitive `effect` range, so `pnpm-workspace.yaml` overrides `effect` to patched 3.20.0 until the upstream dependency selects it directly.
- Drizzle ORM and `pg` provide server-only runtime database access; Better Auth and its Drizzle adapter own identity/session/reset persistence; Resend owns outbound email transport; `dotenv` is used by setup scripts, while `tsx` is development-only for typed setup/seed/smoke commands. pnpm explicitly permits the required `esbuild` installer and continues denying unnecessary optional native installers.
- Latest stable `uploadthing@7.7.4` is reproducibly patched through pnpm to avoid its server SDK internally invoking deprecated URL getters. The four-line compatibility patch uses the already-returned canonical `ufsUrl`, changes no token/request logic, and must be reviewed or removed on upgrade.
- Prettier 3.9.6 and `eslint-config-prettier` 10.1.8 are exact, development-only dependencies; they are not imported into the production application runtime.
- The 2026-09-06 production dependency audit reported no known vulnerabilities. Keep the audit in CI/release checks because this result is time-sensitive.

## Database provisioning controls

- `pnpm db:setup` connects with the server-only PostgreSQL URL through `pg`; it requires no provider CLI or browser-exposed database SDK. The same server-only pool backs runtime Drizzle queries.
- Ordered migrations run in one transaction under a transaction-scoped advisory lock. Applied filenames and SHA-256 checksums are retained in `gtbs_schema_migrations`; a changed applied file fails closed.
- The content tables enable PostgreSQL row-level security and define no anonymous/authenticated browser policies. Direct owner/server connections remain the intended access path.
- Product rows use a restricted foreign key to Category slugs, and JSONB identity/category checks prevent key columns from silently diverging from the validated domain record. Runtime results are also parsed through the strict Zod persisted-content schema.
- One-time initialization validates committed seeds inside a transaction and writes `gtbs_settings.content_initialized`; reruns do not recreate intentionally deleted records. Legacy JSON/file persistence has been removed.
- Content writes retain protected Admin API authorization/origin/body validation and add cross-instance transaction/advisory-lock coordination. Public pages only perform repository reads.
- `pnpm test:api` uses configured Admin/provider secrets without printing them, targets localhost unless `API_SMOKE_BASE_URL` is explicitly set, creates uniquely named temporary records, and cleans database/provider artifacts. Run it only against an approved environment and do not interrupt cleanup.

## Implemented admin controls

- Better Auth performs password hashing/verification and persists only its hash in `auth_account`. Public signup is disabled; the one-time setup script can create only `ADMIN_EMAIL`.
- Better Auth applies origin protection and generic credential/reset responses. Login and recovery limits are stored in PostgreSQL `auth_rate_limit` with stricter per-path limits, so restarts and horizontal scaling do not reset enforcement.
- Forgot password creates a cryptographically random, one-hour, single-use record in `auth_verification`; Resend delivers the Better Auth callback link from the fixed verified-domain sender.
- Reset callback validation redirects to `/admin/reset-password` with the valid continuation token. Successful replacement consumes the token and revokes every prior session.
- Better Auth sessions are opaque database records in `auth_session`. Cookie caching is disabled; every protected page/mutation performs a current session query and separately requires the normalized session email to equal `ADMIN_EMAIL`.
- Better Auth production cookies are Secure and HttpOnly. Sign out deletes the database session and expires the cookie.
- No auth password, password hash, reset token, rate limit, credential override, or session is persisted in application files or process-local maps.
- Admin responses are no-store and receive restrictive CSP, frame, referrer, MIME, permissions, and transport headers. Admin `img-src` permits `blob:` only so validated local Gallery selections can render short-lived previews before upload; other resource directives do not permit blob URLs.
- Admin pages are no-index and excluded from public chrome.
- The persistent Admin panel shell uses the pathname only for chrome visibility and active-link styling. It does not authorize access; every protected Admin page/API continues to verify the Better Auth database session server-side, and hidden panel UI must never be treated as a security control.
- Admin pages are outside `LanguageProvider` and stay English. All storefront-owned English/Gujarati copy, including legal/privacy presentation text, comes from checked-in JSON and renders as escaped React text, so language switching makes no third-party translation request, loads no translator script, and introduces no raw-HTML translation path. Policy wording documents behavior but does not replace the implemented controls described here.
- Product/category/blog/gallery/testimonial/team mutations require the current Better Auth database session plus same-origin request checks and the explicit admin marker header.
- Product and Category mutation bodies are capped at 64 KiB and validated with strict schemas. Product drafts reject client-supplied IDs, while Category drafts reject client-supplied slugs and require bounded English/Gujarati names; repository create mutations generate route keys from validated English titles/names and update mutations retain stored keys. Product writes also verify the referenced Category inside the serialized repository mutation, preventing stale clients from creating orphan relationships.
- Product card image references are restricted to local paths or UploadThing hosts. Managed detail-image records and legacy extra references accept only local paths, UploadThing, or the two already configured Unsplash hosts; arbitrary remote hosts are rejected before persistence.
- Product detail uploads accept at most 6 files per Product, with the same MIME, signature, positive-size, and 500 KiB checks as other managed images. Product update/delete cleans up unretained managed card/detail keys best-effort without deleting keyless legacy URLs.
- Blog create/update JSON bodies are capped at 256 KiB for the two authored language documents; other content JSON bodies retain the 128 KiB default. Every payload is validated with a strict Zod schema. Blog and Gallery mutation drafts reject client-supplied slugs; their repositories generate unique route keys on create and retain stored keys on update.
- Product specification and variant input is bounded at every nested level: at most 50 specification rows, 20 variant groups, and 50 options per group, with length-limited names and values. Legacy book fields are accepted only by the persisted-store schema and rejected by mutation schemas.
- Product create/update validation requires a strict Gujarati content block with a bounded title, descriptions, overview, features, specifications, and variants. The same nested row, group, option, and text limits apply independently to English and Gujarati input; persisted legacy Products may omit the block for backward compatibility.
- Legacy Product availability, stock-count, rating, and review-count fields are accepted only when validating stored content and are rejected at create/update boundaries.
- Legacy Product author/creator and author-details fields are accepted only by persisted-content validation and are rejected by Product create/update schemas.
- English and Gujarati Blog rich-text payloads are independently bounded and use the same allow-list of Tiptap node/mark types, primitive attributes, and `http:`, `https:`, `mailto:`, `tel:`, or same-site link targets. Both public language variants render through explicit React elements without `dangerouslySetInnerHTML`.
- Gallery mutations require strict bounded English and Gujarati text blocks; unknown fields such as the removed Subtitle are rejected. Stored legacy Gallery records may retain optional Subtitle data but it is no longer accepted from create/update forms.
- Testimonial mutations require strict bounded English and Gujarati name, role, and review text plus an integer Rating from 1 through 5. Unknown properties are rejected; stored backward-compatible records may omit Gujarati content, while new writes may not.
- Team mutations require strict bounded English and Gujarati member names/roles plus a valid shared image reference. Unknown properties are rejected; stored backward-compatible records may omit Gujarati content, while new writes may not. Replaced and deleted managed Team image keys receive best-effort provider cleanup.
- Upload bodies are capped for one cover/primary/Team image or twelve Gallery photos plus multipart overhead. Every file is limited to 500 KiB, allow-listed to JPG/PNG/WebP, checked for positive size, and verified against the corresponding binary signature before UploadThing receives it.
- Gallery extra photos are capped at 12 independently in the browser, upload route, content schema, and focused tests.

## Storefront cookies

- The former storefront cookie-consent banner and `gtbs_cookie_consent` cookie have been removed.
- The language provider clears the legacy consent cookie and local-storage choice for returning visitors.
- The language preference is stored in `localStorage`; no storefront translation cookie or third-party translator is used. The provider expires the former `googtrans` cookie for returning visitors.
- No analytics, advertising, or personalization cookies are implemented in the storefront.

## Browser-local Cart data

- Cart persists only bounded Product display data, selected variants, price, quantity, and a non-sensitive read/unread header-badge marker in `localStorage`; no credential, payment, session, or admin data belongs there.
- Stored values are treated as untrusted and normalized on read. They remain client-controlled and must never become authoritative price, inventory, or order data for a future payment backend.
- Product Buy Now and Cart send prepared item details through an external WhatsApp link and explicitly require business confirmation of availability, delivery, final total, and payment. The site itself never collects payment credentials.

## Known gaps before mature production use

- Add database roles and audit logs if multiple Admin identities/permissions are required; current authorization intentionally permits only `ADMIN_EMAIL`.
- Add CSRF review/protection to future state-changing endpoints; current Better Auth and content/email routes enforce their documented origin controls.
- Extend Content Security Policy coverage beyond Admin routes after auditing storefront third-party integrations.
- Configure Vercel `DATABASE_URL` with Supabase's TLS transaction-pooler URL and retain `DATABASE_POOL_MAX=2`. Validate the exact copied pooler URL before deployment; malformed tenant usernames fail both builds and runtime queries.
- Add an orphan-file reconciliation job if UploadThing usage grows; a successful upload followed by a rejected content mutation can leave an unreferenced provider file.
- Monitor Resend delivery, spam reputation, and quotas. The send-scoped key and verified sender were exercised successfully, but operational delivery remains provider-dependent.
- Add dependency vulnerability scanning to CI even though the current production audit is clean.

## Authentication invariants

- Never authorize from client state or a remembered email.
- Every protected admin page and API verifies server-side authorization.
- Hidden UI is not authorization.
- Every future admin mutation performs its own authorization.
- Every admin mutation also applies the shared same-origin request check; the marker header is defense-in-depth, not a secret.
- Inline Category creation in the Product form uses the same protected Category mutation endpoint and must never rely on Product-form visibility as authorization.
- Credentials never go in URLs, analytics, logs, or error responses.
- A reset request for an unknown email must follow the same public response contract and must never trigger delivery. Reset completion requires Better Auth's unexpired single-use PostgreSQL verification token.

## Input/output safety

- Treat forms, params, cookies, and third-party responses as untrusted.
- Validate and normalize at boundaries.
- Avoid `dangerouslySetInnerHTML` unless sanitized and reviewed.
- Restrict remote images through `next.config.ts`.
- Allow-list protocols/hosts before rendering arbitrary external URLs.

## Release checklist

- [ ] Production secrets are unique and stored in a secret manager.
- [x] Resend accepts Contact and password-reset messages from `support@gtbsbooks.com` using the send-scoped server key.
- [ ] HTTPS is enforced; the Better Auth production cookie is observed as Secure on Vercel.
- [x] Preview builds emit layered metadata/header/robots search exclusion; verify the assigned staging domain after each deployment-topology change.
- [ ] Example credentials fail.
- [x] Protected pages/mutations reject missing/invalid sessions; valid reset completion revokes the previous database session.
- [x] Better Auth and public-email throttles use shared PostgreSQL storage; Vercel Firewall can add outer limits.
- [ ] Dependency/source scans have no unresolved high-severity findings.
- [ ] Errors reveal no secrets, stacks, or internal paths.
- [ ] Security changes are recorded in `PROGRESS.md`.
