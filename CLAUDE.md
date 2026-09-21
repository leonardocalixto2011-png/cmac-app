# CMAC Beauty — standalone e-commerce app (cmacbeauty.ca)

Montréal / L'Assomption beauty-tech brand selling 4 at-home devices, fulfilled
via CJdropshipping. **Own project, own Stripe / Resend / Neon accounts** — never
share keys or code paths with the Couca & Co. app (`C:\Users\leona\couca-app`),
which it was scaffolded from.

Zero-monthly-cost stack: Next.js 16 (App Router, Turbopack) · React 19 · TS ·
Tailwind v4 · Prisma 6 · Neon Postgres · Auth.js v5 (credentials admin) ·
Stripe Checkout · Resend (REST) · Vercel free tier.

## Copy rule — Health Canada (READ BEFORE EDITING ANY TEXT)

All devices are marketed as **cosmetic, at-home tools**. Copy is appearance-only
("the look of", "appearance of"). NEVER: treats, heals, cures, stimulates
collagen, reduces inflammation, repairs skin, pain relief, clinically proven, or
any disease word. Applies to products, homepage, emails, admin, metadata.
Source: `../OneDrive/Claude projets/cmac-store/research/sourcing-report-2026-09-20.md`.

## Known facts (`src/lib/brand.ts` — single source of truth)

- Name CMAC Beauty · domain https://cmacbeauty.ca · Montréal & L'Assomption, QC
- Contact/admin email `cmac.13@outlook.com` (owner-supplied; **placeholder public
  contact until a branded mailbox exists**)
- Currency CAD, Canada-only shipping
- Shipping: flat **$9.99**, **free at $75+** subtotal (`SHIPPING` const). Hero,
  marquee, FAQ, cart, product page, policies and Stripe all read this constant.
- Delivery estimate **2–4 weeks** (CJ from China), processing 1–3 business days
- Returns **30 days** unused in original packaging; hygiene items unopened
- Warranty **12 months** against manufacturing defects
- No invented reviews, awards or stats. Stats shown (10 min / 3x / 60 s) are
  routine timings from the design brief, not results.

## i18n

EN default, FR toggle (cookie `cmac-locale`). `src/i18n/messages.ts` flat keys +
`translate()`; `LocaleProvider` (`useLocale()` / `useT()`) for client
components; `src/i18n/server.ts` (`serverLocale()` / `serverT()`) for metadata
and server pages. Long-form pages live in `src/content/pages.ts`, FAQ in
`src/content/faq.ts` — both bilingual. Product copy is bilingual in the DB
(`nameEn/nameFr`, `tagline/taglineFr`, `descriptionEn/descriptionFr`).
**Nothing user-facing may be EN-only** (Québec law). Admin UI is EN-only
(owner-facing).

## Routes

| Route | Notes |
|---|---|
| `/` | Hero, Marquee, FeaturedProducts (DB), Benefits (counting stats), Routine (self-drawing line, links to products), FounderNote (rotating stamp), Faq (details/summary + FAQPage JSON-LD), Newsletter |
| `/shop` | grid + collection filter chips |
| `/shop/[slug]` | gallery, tagline, price + compare-at, variant options, add to cart, description HTML (How to use / Good to know), delivery+returns block, Product JSON-LD |
| `/collections/glow|sculpt|cool|the-ritual` | tag-based; `the-ritual` = all active |
| `/cart` | localStorage cart (`cmac-cart`), shipping preview, Stripe checkout |
| `/shop/thanks?order=<ref>` | clears cart |
| `/about /faq /shipping-returns /contact /privacy /terms /refund-policy` | bilingual; contact stores `ContactMessage` + emails owner |
| `/admin/login`, `/admin`, `/admin/orders`, `/admin/products`, `/admin/subscribers` (+ `/export` CSV) | guarded by `src/proxy.ts` (Next 16 middleware) |
| `/api/stripe/webhook` | `checkout.session.completed` → PAID + address + emails |
| `/api/health` | DB ping |
| `sitemap.xml`, `robots.txt`, `opengraph-image`, `icon.svg` | SEO |

## Key files

- `src/lib/shop.ts` — `listProducts(collection?)`, `getProduct`, `validateCart`
  (re-checks price/options server-side, computes shipping), order helpers.
- `src/app/shop/actions.ts` — `checkout()`: PENDING order → Stripe Checkout
  Session (mode payment, CAD, `allowed_countries: ['CA']`, one `shipping_options`
  entry = flat or free, `automatic_tax` OFF, metadata `orderId`, PI description
  "CMAC Beauty — order <REF>"). Returns `PAYMENT_UNAVAILABLE` when
  `STRIPE_SECRET_KEY` is unset (UI shows a graceful message).
- `src/lib/email.ts` — Resend via REST or console log. Customer: order
  confirmation + shipping notice (EN/FR per order locale). Owner: new order,
  contact forward → `OWNER_NOTIFY_EMAIL` (fallback `ADMIN_EMAIL`).
- `src/app/admin/actions.ts` — `setOrderStatus`, `fulfilOrder` (tracking number
  + URL + supplier order id → FULFILLED + `fulfilledAt` + customer tracking
  email), product CRUD.
- `src/components/Motion.tsx` — port of cmac-motion.js (reveal / tilt /
  counters / cursor glow; reduced-motion aware), mounted once in layout.
- `src/app/globals.css` — `@theme` tokens, keyframes, ported section CSS.
- Fonts: Fraunces (variable, opsz axis, italic) + Inter via `next/font/google`.

## Data model (`prisma/schema.prisma`)

Product (tagline/taglineFr, tags[], compareAtCents, supplierUrl/Sku,
shippingNote), Order (shippingCents, totalCents, contactName, tracking*,
fulfilledAt, supplierOrderId, stripePaymentIntentId), Customer (minimal),
Subscriber (`email @unique`, locale), ContactMessage, Auth.js models
(User/Account/Session/VerificationToken + UserRole).
Single baseline migration `prisma/migrations/0_init` (generated with
`prisma migrate diff --from-empty`). Add new migrations with `prisma migrate dev`.

## STILL PLACEHOLDER — needs the owner

- **Product images**: `images: []` → `ProductArt` renders a branded gradient
  placeholder. Paste supplier photo URLs in `/admin/products` (one per line).
- **Ice roller colours** "Pink / White / Sage": placeholder option values. Real
  colour names + variant SKUs come from the CJ listing (edit Options JSON in admin).
- **`supplierUrl` / `supplierSku`** empty until the CJ listings are chosen.
- **Hero + founder visuals** are CSS placeholders (`Hero.tsx`, `FounderNote.tsx`).
- **Contact email** `cmac.13@outlook.com` → replace with a branded mailbox in
  `src/lib/brand.ts` and `EMAIL_FROM` once the Resend domain is verified.
- Newsletter headline is "Be first to know" (no "10% off" promise) because no
  discount code / welcome email exists yet. If the owner wants the 10% offer:
  create a Stripe coupon + promotion code, set `allow_promotion_codes: true` in
  `checkout()`, and update `news.title` in messages.ts.
- Legal pages (`privacy`, `terms`, `refund-policy`) are sensible generic
  Québec/Canada policies, not legal advice — owner should review.

## Env vars (`.env.example`)

`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`,
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_NOTIFY_EMAIL`. Never commit `.env`.

## Local development

```bash
npm install
npx prisma dev --name cmac        # local Postgres; daemonises; port per machine
# .env POSTGRES_PRISMA_URL = its URL + ?sslmode=disable&pgbouncer=true&connection_limit=1
npm run db:push                   # or db:migrate
npm run db:seed                   # 4 products + admin (ADMIN_EMAIL/ADMIN_PASSWORD)
npm run dev                       # http://localhost:3000
```

Dev admin: `admin@cmacbeauty.ca` / `cmac-admin-dev` (change for prod).
`npm run typecheck` · `npm run lint` · `npm run build`. On Windows, stop `next dev`
before `npm run build` or `prisma generate` hits EPERM on the locked engine DLL.
Seed is idempotent (only `sortOrder` updated on re-run); `RESET_PRODUCTS=1` to
overwrite copy/prices from the seed file.

## Deploy runbook (owner)

1. **GitHub**: push this repo (branch `main`).
2. **Neon**: create a project → copy the **pooled** string to `POSTGRES_PRISMA_URL`
   and the **direct** string to `POSTGRES_URL_NON_POOLING`.
3. **Vercel**: import the GitHub repo. Add every env var from `.env.example`
   (`AUTH_URL` / `NEXT_PUBLIC_SITE_URL` = `https://cmacbeauty.ca`,
   `AUTH_SECRET` from `npx auth secret`, strong `ADMIN_PASSWORD`). Vercel runs
   `vercel-build` (`prisma generate && prisma migrate deploy && next build`)
   automatically, applying `0_init`.
4. **Seed once** from the owner's machine against prod:
   `POSTGRES_PRISMA_URL=<neon pooled> POSTGRES_URL_NON_POOLING=<neon direct> ADMIN_EMAIL=… ADMIN_PASSWORD=… npx prisma db seed`
5. **Domain**: point `cmacbeauty.ca` at Vercel (Vercel → Domains).
6. **Stripe** (CMAC's own account): API keys → `STRIPE_SECRET_KEY`. Developers →
   Webhooks → add endpoint `https://cmacbeauty.ca/api/stripe/webhook`, event
   `checkout.session.completed` → signing secret → `STRIPE_WEBHOOK_SECRET`.
   Test with test keys first (`stripe listen --forward-to localhost:3000/api/stripe/webhook`).
7. **Resend**: verify the sending domain, set `RESEND_API_KEY` + `EMAIL_FROM`
   (+ `OWNER_NOTIFY_EMAIL`). Until then emails log to the server console.
8. Log in at `/admin/login`, paste product images / supplier URLs / real colour
   names, then place a test order.

## Fulfilment loop

Order PAID (webhook) → owner email → owner places the CJ order → in
`/admin/orders` click **Mark fulfilled**, enter tracking number, tracking URL,
CJ order id → order FULFILLED + customer emailed in their language.

## Setup notes

- Node at `C:\Program Files\nodejs` (v24). npm 11 needs `allowScripts` in
  package.json for prisma/esbuild install scripts (already pinned).
- Project path deliberately outside OneDrive and without `&`.
- `next-env.d.ts` and `.next/` are generated; ignored by git.
