# GTBS Book Store

Responsive e-commerce storefront and administration workspace for Gujarat Tract Book Store, built with Next.js, React, TypeScript, and Tailwind CSS.

Product sales are WhatsApp-assisted: Buy Now sends one Product with quantity/details/link, while the browser-local Cart sends multiple selected Products in one itemized message. Wishlist, Checkout, and customer-account pages are intentionally outside the storefront scope.

## Start locally

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env` and configure required values before using integrations or admin login. Never commit real environment values.

Blog and gallery image uploads require a server-only `UPLOADTHING_TOKEN`. Product, Category, Blog, Gallery, Testimonial, and Team content is persisted in PostgreSQL through the server-only Drizzle repository.

To create or update the PostgreSQL schema without a provider-specific CLI, set the server-only `DATABASE_URL` and run:

```bash
pnpm db:setup
```

The command applies checksum-tracked migrations, then initializes content exactly once from committed Product, Category, Testimonial, and Team seeds. The initialization marker makes reruns safe and prevents deleted records from being silently reseeded. Runtime and setup code never use local JSON persistence.

Admin email/password authentication, sessions, password-reset tokens, and auth rate limits use Better Auth with PostgreSQL. After migrations, set `ADMIN_EMAIL` and run `pnpm admin:setup` once in a private interactive terminal; the password is hashed directly into PostgreSQL and is never written to a file or environment variable. Configure stable `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` values in deployment.

Contact and Admin password-reset mail is sent server-side through Resend from `GTBS Support <support@gtbsbooks.com>`. Configure only the send-scoped `RESEND_API_KEY`; no browser email key is used.

## Vercel deployment

`main` is the production branch for `https://gtbsbooks.com`; `staging` is the preview branch for `https://staging.gtbsbooks.com`. `vercel.json` disables Git-triggered deployment for every other branch. Configure the production and preview environment scopes separately so each scope's `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` match its custom domain.

Every Vercel Preview build emits page-level noindex metadata, an `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex` response header, and a `robots.txt` that disallows `/`. The stable staging branch domain is also covered by Vercel Authentication. Production remains indexable. Do not promote a preview build to Production without rebuilding it in the Production environment.

GoDaddy remains the registrar, while Vercel nameservers host the active DNS zone. The zone includes Resend's sending records plus Google Workspace MX/SPF records for incoming support mail; the Workspace account must remain active and complete any Google-side domain verification.

## Quality checks

```bash
npx tsc --noEmit
pnpm test:admin-auth
pnpm test:content
pnpm test:site
# With the local app running; creates and removes temporary DB/provider records:
pnpm test:api
pnpm lint
pnpm audit --prod
pnpm build
```

All repository lint, type, focused test, and production dependency audit checks currently pass. Windows sandbox environments may still block build/test child processes with `spawn EPERM`; see troubleshooting for the verified fallback checks.

## Documentation

Project knowledge is maintained in [`docs/README.md`](./docs/README.md):

- [Project overview](./docs/PROJECT_OVERVIEW.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Project rules](./docs/RULES.md)
- [Code standards](./docs/CODE_STANDARDS.md)
- [Security](./docs/SECURITY.md)
- [Progress](./docs/PROGRESS.md)
- [Errors and solutions](./docs/TROUBLESHOOTING.md)

Every development change must update the relevant documentation. See [`AGENTS.md`](./AGENTS.md) for the repository working agreement.
