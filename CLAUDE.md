# CMAC Beauty — standalone e-commerce app (cmacbeauty.ca)

Montréal / L'Assomption beauty-tech brand selling at-home devices + ritual essentials (16 active
products incl. 6 set add-ons: satin sleep set, scrunchie, shell pouch, travel organizer, fleece socks,
cleansing puff), fulfilled via CJdropshipping. **Own project, own Stripe / Resend / Neon accounts** — never
share keys or code paths with the Couca & Co. app (`C:\Users\leona\couca-app`),
which it was scaffolded from.

Zero-monthly-cost stack: Next.js 16 (App Router, Turbopack) · React 19 · TS ·
Tailwind v4 · Prisma 6 · Neon Postgres · Auth.js v5 (credentials: admin + customers) ·
Stripe Checkout · Resend (REST) · Vercel free tier.

## Copy rule — Health Canada (READ BEFORE EDITING ANY TEXT)

All devices are marketed as **cosmetic, at-home tools**. Copy is appearance-only
("the look of", "appearance of"). NEVER: treats, heals, cures, stimulates
collagen, reduces inflammation, repairs skin, pain relief, clinically proven, or
any disease word. Applies to products, homepage, emails, admin, metadata.
Source: `../OneDrive/Claude projets/cmac-store/research/sourcing-report-2026-09-20.md`.

## Known facts (`src/lib/brand.ts` — single source of truth)

- Name CMAC Beauty · domain https://cmacbeauty.ca · Montréal & L'Assomption, QC
- Public contact email `cmacbeauty.ca@outlook.com` (`BRAND.email`); admin login email comes from `ADMIN_EMAIL`
- Currency CAD, Canada-only shipping
- Shipping: flat **$9.99**, **free at $75+** subtotal (`SHIPPING` const). Hero,
  marquee, FAQ, cart, product page, policies and Stripe all read this constant.
  Glow Club tiers lower the threshold for members (Radiance $50, Icon always free) — see below.
- Delivery: processing **3–5 business days** (CJ buys most items from the factory first;
  sets are consolidated into one parcel), then **7–15 business days** transit (CJPacket JYSP
  Sensitive, China → Canada). Transit ≈ 1–3 weeks (`deliveryWeeks`), order-to-door ≈ **2–4 weeks**
  (`totalWeeks`: Stripe estimate, confirmation email, product page). Google feeds read
  `processingDays` for `min/max_handling_time`: keep Merchant Center shipping handling time 3–5 in sync.
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
| `/collections/sets|glow|sculpt|cool|essentials|the-ritual` | tag-based; `the-ritual` = all active single products (tag `sets` excluded) |
| `/cart` | localStorage cart (`cmac-cart`), shipping preview, Stripe checkout |
| `/shop/thanks?order=<ref>` | clears cart |
| `/about /faq /shipping-returns /contact /privacy /terms /refund-policy` | bilingual; contact stores `ContactMessage` + emails owner |
| `/account` | member dashboard: tier + progress bar, points, redeem, reward codes, recent orders, points activity (redirects to `/account/login?from=`; admins → `/admin`) |
| `/account/login`, `/account/register`, `/account/reset` (`?token=`) | customer sign-in / sign-up (birthday optional, newsletter box unchecked) / password reset |
| `/account/orders`, `/account/orders/[reference]` | order list + detail (items, status, totals, tracking link once FULFILLED, city/province only) — owner check → 404 |
| `/account/profile` | name, birthday, email language, newsletter on/off, change password, **Delete my account** (Law 25) |
| `/glow-club` | public programme page (how it works, tier table, FAQ + FAQPage JSON-LD, CTA) |
| `/newsletter/confirm?token=`, `/newsletter/unsubscribe?token=` | double opt-in landing (shows WELCOME10) / one-click unsubscribe; both act from the browser (link scanners can't) and show a friendly page for bad tokens |
| `/admin/login`, `/admin` (+ integrations status panel), `/admin/orders`, `/admin/products`, `/admin/customers` (members, points adjust), `/admin/newsletter` (counts + campaign composer), `/admin/subscribers` (+ `/export` CSV with consent columns) | guarded by `src/proxy.ts` (Next 16 middleware) + admin layout (role ADMIN) |
| `/api/stripe/webhook` | `checkout.session.completed` → PAID + address + discount + emails; links the customer, credits Glow points, marks reward codes redeemed, cart newsletter opt-in → double opt-in |
| `/api/cron/birthdays` | daily (vercel.json, 14:00 UTC) birthday codes; needs `Authorization: Bearer $CRON_SECRET`; no-op without CRON_SECRET / Stripe |
| `/api/newsletter/unsubscribe?token=` | RFC 8058 one-click target (POST from mail clients); GET redirects to the page |
| `/api/health` | DB ping |
| `sitemap.xml`, `robots.txt`, `opengraph-image`, `icon.svg` | SEO |

## Key files

- `prisma/media.ts` — processed Cloudinary media per slug (4:5 cream images + muted supplier
  videos `{mp4, poster}`). Seed swaps a product's images to these only while all its current
  images are CJ CDN URLs; fills `videos` only while empty. Product page shows the video as slide 2.
- `src/lib/sets.ts` — curated bundle Sets: contents (slug × qty) + CJ variant per component. A set is a
  normal Product tagged `sets`, no options, `supplierSku: "SET"`, `shippingNote` = CJ recipe (ONE CJ order,
  China warehouse, one parcel) (shown in
  /admin/orders and the owner new-order email). Seeded in `prisma/seed.ts` (`SETS`, compare-at = sum of
  components; images = components’ photos). Product page shows a "What’s inside" grid + savings;
  tag `limited` shows a badge (Sweater Weather: deactivate it in /admin after Nov 30). Feeds add `g:is_bundle`.

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

## Customer accounts, Glow Club, newsletter (added 2026-09-21)

- **Auth**: one Credentials provider for ADMIN + CUSTOMER (`src/auth.ts`). Admin form sends `scope: "admin"`, so a
  customer can never get a session from /admin/login; `/admin/*` still requires role ADMIN (proxy + layout).
  bcrypt (12 rounds for customers), generic errors, DB rate limits (`src/lib/rate-limit.ts`, table RateLimit:
  login 8/15 min per email + 30/15 min per IP, register 6/h per IP, reset 3/h per email + 10/h per IP, signup 3/h per email).
- **Sign-up** (`src/app/account/actions.ts`): creates User(CUSTOMER) + links/creates Customer by email, attaches earlier
  guest orders with the same email and credits their points. **TODO(email-verification)**: attach only after verifying
  the email (today, order detail shows only city/province to limit exposure).
- **Password reset**: stateless HMAC token (`src/lib/tokens.ts`) over userId + expiry + current password hash
  (AUTH_SECRET key), 1 h, single use. Customers only. Without Resend the page says "email not available yet, contact us";
  the link is logged to the console in dev only.
- **Delete my account**: orders kept (7 years, tax) but detached + anonymised (email → keyed hash, name/street/phone
  removed, city/province/postal kept); Customer (ledger + codes cascade) and User deleted; newsletter → UNSUBSCRIBED.
- **Glow Club rules** (`src/lib/loyalty-rules.ts`, pure + unit-tested): points = floor(merch $ × rate) where merch =
  subtotal − Stripe discount (shipping excluded); rate Glow 1 / Radiance 1.25 / Icon 1.5 per $, using the tier reached
  **before** the order. Tiers by lifetime merchandise spend: Glow 0+, Radiance $250+, Icon $600+. Free shipping:
  guests & Glow $75, Radiance $50, Icon always (server-side in `validateCart` via the session tier; cart shows the perk).
  Only members (Customer with userId) earn; guest orders are credited when they sign up with the same email.
- **Ledger** (`src/lib/loyalty.ts`): LoyaltyEntry (+/- points, spendCents, reason ORDER_CREDIT | ORDER_REVERSAL |
  REDEEM | ADJUSTMENT, unique (orderId, reason)) + cached `Customer.points` / `lifetimeSpendCents` updated in the same
  transaction. Webhook credits PAID orders; admin status → REFUNDED/CANCELLED reverses; → PAID/FULFILLED credits if
  never credited. Balance can go negative after a reversal (blocks redemption until earned back).
- **Rewards**: 100 pts = $10, redeem 1–10 units per code from /account → single-use Stripe promotion code
  `GLOW-XXXX-XXXX` on coupon `glow-club-{10×units}` (amount_off CAD, once; created if missing). Stripe first, then a
  conditional decrement + ledger + RewardCode in one transaction (Stripe code deactivated if that fails).
  Birthday: cron issues `BDAY-XXXX-XXXX` on `glow-birthday-15` (15 %, once) valid to the end of the next month,
  saved on the account, emailed when Resend + mailing address are set. No Stripe → redemption disabled gracefully.
  Limited sets (tag `limited`) show a "Members first" badge + note.
- **Newsletter (CASL)** (`src/lib/newsletter.ts`, `src/lib/marketing.ts`): Subscriber status PENDING → CONFIRMED →
  UNSUBSCRIBED with consentAt / consentSource (footer | popup | register | checkout | account) / consentText snapshot
  (`consent.newsletter` message) / confirmToken / unsubscribeToken. Double opt-in email → /newsletter/confirm →
  welcome email with **WELCOME10** (coupon `welcome-10` 10 % once + promo code restricted to first-time transactions,
  ensured idempotently). Rows that existed before 2026-09-21 were migrated as PENDING (`consentSource = legacy`) and
  are **not** emailed by campaigns. Marketing emails carry sender, contact email, BUSINESS_MAILING_ADDRESS, reason,
  unsubscribe link + List-Unsubscribe / List-Unsubscribe-Post headers, in the subscriber's language.
- **Signup capture**: homepage section (consent line), cart checkbox (unchecked; webhook subscribes on payment),
  register checkbox, profile toggle, and `NewsletterPopup` (25 s or 50 % scroll; not on /cart, /account, /admin,
  /newsletter, /shop/thanks; 14-day dismiss in localStorage `cmac-news-popup`; hidden for signed-in subscribers;
  modal with Esc + focus trap).
- **Campaigns** (`/admin/newsletter`): EN + FR subject / preheader / Markdown body (`src/lib/markdown.ts`, escaped),
  up to 4 product cards with UTM links, "Send test to me" (required before the full send), "Send to all confirmed"
  (Resend batch API, 100 per request, ~600 ms apart, retry on 429; Campaign row with counts). Blocked with a clear
  message when RESEND_API_KEY or BUSINESS_MAILING_ADDRESS is missing.
- **Email layer**: `sendEmail` returns a boolean; unset Resend → nothing sent (prod logs subject only). Admin
  dashboard shows which env vars are present (`src/lib/integrations.ts`, never values).
- `LangToggle` now also calls `router.refresh()` so server-rendered pages (account, metadata) switch language.
- Nav: "How it works" link replaced by "Glow Club" (keeps 7 links); account icon next to the cart (dot when signed in).

## Data model (`prisma/schema.prisma`)

Product (tagline/taglineFr, tags[], images/videos Json, compareAtCents, supplierUrl/Sku,
shippingNote), Order (shippingCents, totalCents, contactName, tracking*,
fulfilledAt, supplierOrderId, stripePaymentIntentId, discountCents, newsletterOptIn), Customer (email @unique,
userId → User, birthMonth/birthDay, birthdayRewardYear, points, lifetimeSpendCents), LoyaltyEntry, RewardCode,
Subscriber (status, consent*, confirmToken, unsubscribeToken, confirmedAt, unsubscribedAt), Campaign, RateLimit,
ContactMessage, Auth.js models (User/Account/Session/VerificationToken + UserRole).
Migrations: baseline `prisma/migrations/0_init` (generated with
`prisma migrate diff --from-empty`) + `20260921120000_product_videos` + `20260921180000_accounts_glow_club_newsletter`
(hand-edited: backfills unsubscribe tokens, keeps old subscribers PENDING). Add new migrations with `prisma migrate dev`
or hand-written SQL from `prisma migrate diff`.

## STILL PLACEHOLDER — needs the owner

- **Product images** are processed Cloudinary photos (`prisma/media.ts`, 2026-09-21) derived from CJ
  supplier photos (see `cmac-store/media/media-report.md`). Before that they were CJ CDN photos (research in
  `../OneDrive/Claude projets/cmac-store/research/cj-catalog-2026-09-21.json`).
  LED mask has only 1 clean CJ photo (the rest show a bundled serum): replace
  with own sample photos. `ProductArt` still falls back to the branded gradient
  when a product has no images. Cards cross-fade to the 2nd image on hover.
- **Catalogue / supplier data** (`prisma/seed.ts`): real CJ variant names as
  option values, `supplierUrl` / `supplierSku`, and `shippingNote` mapping each
  colour to its CJ SKU + landed cost. The seed only fills images/options/
  supplier fields on rows whose `images` is still empty, so admin edits win.
- `electronic-gua-sha-massager` is **inactive** (no face gua sha on CJ);
  replaced by `ems-sculpting-v-roller`.
- **Hero + founder visuals** are CSS placeholders (`Hero.tsx`, `FounderNote.tsx`).
- **Contact email** `cmac.13@outlook.com` → replace with a branded mailbox in
  `src/lib/brand.ts` and `EMAIL_FROM` once the Resend domain is verified.
- Newsletter offer "10% off your first order" = WELCOME10, shown on the confirm page and emailed once
  Resend + BUSINESS_MAILING_ADDRESS are set (see "Owner setup — accounts, Glow Club, newsletter").
- Legal pages (`privacy`, `terms`, `refund-policy`) are sensible generic
  Québec/Canada policies, not legal advice — owner should review.

## Env vars (`.env.example`)

`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`,
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`RESEND_API_KEY`, `EMAIL_FROM`, `BUSINESS_MAILING_ADDRESS` (CASL postal address), `CRON_SECRET`
(birthday cron), `OWNER_NOTIFY_EMAIL`. Never commit `.env`.

## Local development

```bash
npm install
npx prisma dev --name cmac        # local Postgres; daemonises; port per machine
# .env POSTGRES_PRISMA_URL = its URL + ?sslmode=disable&pgbouncer=true&connection_limit=1
npm run db:push                   # or db:migrate
npm run db:seed                   # catalogue + admin (ADMIN_EMAIL/ADMIN_PASSWORD)
npm run dev                       # http://localhost:3000
```

Dev admin: `admin@cmacbeauty.ca` / `cmac-admin-dev` (change for prod).
`npm test` (vitest: loyalty rules, shipping per tier, redemption, reset-token expiry, markdown) ·
`npm run typecheck` · `npm run lint` · `npm run build`. On Windows, stop `next dev`
before `npm run build` or `prisma generate` hits EPERM on the locked engine DLL.
Seed is idempotent (`sortOrder` always; supplier data only while `images` is
empty; images → Cloudinary only while all are CJ URLs; set price/compare-at only while the
set is still at its launch price `prevPriceCents`; set copy only via verbatim seed fragments); `RESET_PRODUCTS=1` to overwrite copy/prices/tags/options from the seed.

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

## Owner setup — accounts, Glow Club, newsletter

1. **Resend** (emails): verify `cmacbeauty.ca` in Resend, then in Vercel set `RESEND_API_KEY` and
   `EMAIL_FROM` (e.g. `CMAC Beauty <hello@cmacbeauty.ca>`). Until then: no order / reset / newsletter emails are
   sent, the reset page tells customers to write to the contact email, signups stay PENDING.
2. **Mailing address** (CASL): set `BUSINESS_MAILING_ADDRESS` to a real postal address (a PO box is fine).
   Until then campaigns, welcome and birthday emails are blocked.
3. **Cron**: set `CRON_SECRET` (`openssl rand -hex 32`) in Vercel; `vercel.json` already schedules
   `/api/cron/birthdays` daily. Redeploy after adding env vars.
4. **Stripe**: nothing to create by hand — coupons `glow-club-*`, `glow-birthday-15`, `welcome-10` and the
   `WELCOME10` code are created on first use. Keep the webhook on `checkout.session.completed`.
5. **Privacy policy**: add the name/title of the person in charge of personal information (comment `OWNER:` in
   `src/content/pages.ts`). Review the Glow Club terms section (`/terms#glow-club`).
6. **Legacy subscribers** (PENDING, source `legacy`): they never confirmed, so they get no campaigns. They can
   re-join from the site; do not bulk-email them a confirmation request without legal advice (CASL).

## Fulfilment loop

Order PAID (webhook) → owner email → owner places the CJ order → in
`/admin/orders` click **Mark fulfilled**, enter tracking number, tracking URL,
CJ order id → order FULFILLED + customer emailed in their language.

## Setup notes

- Node at `C:\Program Files\nodejs` (v24). npm 11 needs `allowScripts` in
  package.json for prisma/esbuild install scripts (already pinned).
- Project path deliberately outside OneDrive and without `&`.
- `next-env.d.ts` and `.next/` are generated; ignored by git.
