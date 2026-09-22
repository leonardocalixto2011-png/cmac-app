/**
 * Renders every customer / owner email with realistic sample data (EN + FR) to
 * static HTML files, and optionally PNG screenshots via headless Chrome/Edge.
 *
 *   npx tsx scripts/render-email-previews.ts            # HTML only
 *   npx tsx scripts/render-email-previews.ts --png      # + PNG screenshots (640px, and 375px for the confirmation)
 *
 * Output: EMAIL_PREVIEW_DIR or ../OneDrive/Claude projets/cmac-store/emails/previews.
 * Product images come from the live Google feed (https://cmacbeauty.ca/feeds/google.xml);
 * nothing touches the database, Stripe or Resend.
 */
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir, tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import type { Locale } from "../src/i18n/messages";
import { SET_CONTENTS } from "../src/lib/sets";
import {
  renderAccountWelcome,
  renderBirthday,
  renderConfirmRequest,
  renderOrderConfirmation,
  renderOwnerOrder,
  renderPasswordReset,
  renderRewardCode,
  renderShipped,
  renderWelcome,
  type CardProduct,
  type ItemView,
  type OrderView,
  type RenderedEmail,
} from "../src/lib/email-templates";

const OUT = resolve(process.env.EMAIL_PREVIEW_DIR ?? join(homedir(), "OneDrive", "Claude projets", "cmac-store", "emails", "previews"));

// Names (seed) + live prices (feed sale prices). Images are filled from the feed.
const CATALOG: Record<string, { en: string; fr: string; price: number; compareAt?: number }> = {
  "led-red-light-mask": { en: "LED Red Light Mask", fr: "Masque LED lumière rouge", price: 5999, compareAt: 8999 },
  "microcurrent-facial-lift-device": { en: "Microcurrent Facial Lift Device", fr: "Appareil microcourant effet lift", price: 8999 },
  "facial-ice-roller": { en: "Facial Ice Roller", fr: "Rouleau de glace pour le visage", price: 2699 },
  "under-eye-glow-wand": { en: "Under-Eye Glow Wand", fr: "Baguette éclat contour des yeux", price: 4499 },
  "sonic-silicone-cleansing-brush": { en: "Sonic Silicone Cleansing Brush", fr: "Brosse nettoyante sonique en silicone", price: 3499 },
  "spa-headband": { en: "Spa Headband", fr: "Bandeau spa", price: 1699 },
  "satin-scrunchie": { en: "Satin Scrunchie", fr: "Chouchou en satin", price: 1599 },
  "satin-beauty-sleep-set": { en: "Satin Beauty-Sleep Set (4 pieces)", fr: "Ensemble beauté-sommeil en satin (4 pièces)", price: 3999 },
  "reusable-cleansing-puff": { en: "Reusable Cleansing Puff", fr: "Houppette démaquillante réutilisable", price: 2099 },
  "set-full-ritual": { en: "The Full Ritual", fr: "Le Rituel complet", price: 16999, compareAt: 23395 },
  "set-7am-reset": { en: "The 7 AM Reset", fr: "Le Reset de 7 h", price: 7999, compareAt: 12595 },
  "set-midnight-glow": { en: "Midnight Glow Ritual", fr: "Rituel Éclat de minuit", price: 10999, compareAt: 13497 },
};

async function feedImages(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const xml = await (await fetch("https://cmacbeauty.ca/feeds/google.xml")).text();
    for (const m of xml.matchAll(/<g:id>([^<]+)<\/g:id>[\s\S]*?<g:image_link>([^<]+)<\/g:image_link>/g)) map.set(m[1], m[2].replace(/&amp;/g, "&"));
  } catch (err) {
    console.warn("feed unavailable — previews render without photos", err);
  }
  return map;
}

function item(slug: string, locale: Locale, images: Map<string, string>, opts: { qty?: number; options?: string[] } = {}): ItemView {
  const p = CATALOG[slug];
  return {
    slug,
    name: locale === "fr" ? p.fr : p.en,
    options: opts.options ?? [],
    qty: opts.qty ?? 1,
    unitCents: p.price,
    image: images.get(slug) ?? null,
    components: (SET_CONTENTS[slug] ?? []).map((c) => ({
      slug: c.slug,
      name: locale === "fr" ? CATALOG[c.slug]?.fr ?? c.slug : CATALOG[c.slug]?.en ?? c.slug,
      qty: c.qty,
      image: images.get(c.slug) ?? null,
    })),
  };
}

function card(slug: string, locale: Locale, images: Map<string, string>): CardProduct {
  const p = CATALOG[slug];
  return { slug, name: locale === "fr" ? p.fr : p.en, priceCents: p.price, compareAtCents: p.compareAt ?? null, image: images.get(slug) ?? null, isSet: slug.startsWith("set-") };
}

const PLACED = new Date("2026-09-21T14:32:00-04:00");

function orders(images: Map<string, string>): Record<Locale, OrderView> {
  const en: ItemView[] = [item("set-7am-reset", "en", images), item("microcurrent-facial-lift-device", "en", images, { options: ["Pink"] })];
  const enSub = en.reduce((s, i) => s + i.unitCents * i.qty, 0);
  const enDisc = Math.round(enSub * 0.1);
  const fr: ItemView[] = [item("set-midnight-glow", "fr", images), item("facial-ice-roller", "fr", images, { options: ["Rose"] })];
  const frSub = fr.reduce((s, i) => s + i.unitCents * i.qty, 0);
  return {
    en: {
      locale: "en",
      reference: "cmfq8x2k40000ab12c7r3dq9",
      placedAt: PLACED,
      name: "MARIE-ÈVE TREMBLAY",
      email: "marie-eve.tremblay@example.com",
      items: en,
      subtotalCents: enSub,
      discountCents: enDisc,
      promoCode: "WELCOME10",
      shippingCents: 0,
      totalCents: enSub - enDisc,
      address: ["Marie-Ève Tremblay", "4521 rue Saint-Denis, app. 3", "Montréal, QC  H2J 2L4", "Canada"],
      loyalty: { kind: "guest", points: Math.floor((enSub - enDisc) / 100) },
    },
    fr: {
      locale: "fr",
      reference: "cmfq9b7td0003ab12h4k8pm2",
      placedAt: PLACED,
      name: "Camille Gagnon",
      email: "camille.gagnon@example.com",
      items: fr,
      subtotalCents: frSub,
      discountCents: 0,
      promoCode: null,
      shippingCents: 0,
      totalCents: frSub,
      address: ["Camille Gagnon", "212 boulevard de l'Ange-Gardien", "L'Assomption, QC  J5W 1S1", "Canada"],
      loyalty: { kind: "member", earned: Math.floor(frSub / 100), balance: 212, tier: "glow" },
      trackingNumber: "CJPKL7012384561YQ",
      trackingUrl: "https://cjpacket.com/?trackingNumber=CJPKL7012384561YQ",
    },
  };
}

function all(images: Map<string, string>): Record<string, RenderedEmail> {
  const o = orders(images);
  const address = "CMAC Beauty, C.P. 12345, succ. Centre-ville, Montréal (Québec) H3C 0A0";
  const out: Record<string, RenderedEmail> = {};
  for (const l of ["en", "fr"] as const) {
    const ord = o[l];
    out[`order-confirmation-${l}`] = renderOrderConfirmation(ord);
    out[`order-confirmation-${l}-alt`] = renderOrderConfirmation({ ...o[l === "en" ? "fr" : "en"], locale: l, items: o[l === "en" ? "fr" : "en"].items.map((i) => item(i.slug, l, images, { options: i.options.length ? [l === "fr" ? "Rose" : "Pink"] : [] })) });
    out[`shipped-${l}`] = renderShipped({ ...o.fr, locale: l, name: ord.name, items: o.fr.items.map((i) => item(i.slug, l, images, { options: i.options.length ? [l === "fr" ? "Rose" : "Pink"] : [] })) });
    out[`newsletter-confirm-${l}`] = renderConfirmRequest({ locale: l, confirmUrl: "https://cmacbeauty.ca/newsletter/confirm?token=sample", mailingAddress: address });
    out[`welcome-${l}`] = renderWelcome({
      locale: l,
      code: "WELCOME10",
      products: ["set-full-ritual", "set-7am-reset", "led-red-light-mask"].map((s) => card(s, l, images)),
      unsubscribeUrl: "https://cmacbeauty.ca/newsletter/unsubscribe?token=sample",
      mailingAddress: address,
    });
    out[`account-welcome-${l}`] = renderAccountWelcome({ locale: l, name: ord.name, creditedPoints: l === "en" ? 152 : 0, hasBirthday: l === "fr" });
    out[`password-reset-${l}`] = renderPasswordReset({ locale: l, url: "https://cmacbeauty.ca/account/reset?token=sample-token" });
    out[`glow-reward-${l}`] = renderRewardCode({ locale: l, name: ord.name, code: "GLOW-7KQ2-M9XD", amountOffCents: 2000, pointsSpent: 200, balance: 48 });
    out[`birthday-${l}`] = renderBirthday({ locale: l, name: ord.name, code: "BDAY-4TRW-P2LN", expiresLabel: l === "fr" ? "31 octobre 2026" : "October 31, 2026", mailingAddress: address });
  }
  out["owner-new-order"] = renderOwnerOrder({
    reference: o.en.reference,
    placedAt: PLACED,
    name: "Marie-Ève Tremblay",
    email: o.en.email,
    locale: "en",
    items: [
      { name: "The 7 AM Reset", options: [], qty: 1, unitCents: 7999, sku: "SET", note: null, components: SET_CONTENTS["set-7am-reset"].map((c) => ({ name: CATALOG[c.slug].en, qty: c.qty, variant: c.variant })) },
      { name: "Microcurrent Facial Lift Device", options: ["Pink"], qty: 1, unitCents: 8999, sku: "CJPF104709101AZ", note: "Pink = CJPF104709101AZ · White = CJPF104709102BY", components: [] },
    ],
    subtotalCents: o.en.subtotalCents,
    discountCents: o.en.discountCents,
    promoCode: "WELCOME10",
    shippingCents: 0,
    totalCents: o.en.totalCents,
    address: [...o.en.address, "+1 514 555 0142"],
    member: false,
    pointsEarned: null,
  });
  return out;
}

// ---------------------------------------------------------------------------
// Headless Chrome screenshots (tiny CDP client, Node ≥ 22 global WebSocket)
// ---------------------------------------------------------------------------

const BROWSERS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

async function screenshots(jobs: { file: string; png: string; width: number }[]) {
  const exe = BROWSERS.find((b) => existsSync(b));
  if (!exe) return console.warn("No Chrome/Edge found — skipping PNGs");
  const port = 9300 + Math.floor(Math.random() * 500);
  const profile = join(tmpdir(), `cmac-email-shots-${port}`);
  const proc = spawn(exe, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "--no-first-run", "about:blank"], { stdio: "ignore" });
  try {
    let wsUrl = "";
    for (let i = 0; i < 50 && !wsUrl; i++) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        const targets = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()) as { type: string; webSocketDebuggerUrl: string }[];
        wsUrl = targets.find((t) => t.type === "page")?.webSocketDebuggerUrl ?? "";
      } catch {}
    }
    if (!wsUrl) throw new Error("Chrome did not start");
    const ws = new WebSocket(wsUrl);
    await new Promise((r) => ws.addEventListener("open", r, { once: true }));
    let id = 0;
    const pending = new Map<number, (v: { result?: Record<string, unknown> }) => void>();
    const events: ((m: { method?: string }) => void)[] = [];
    ws.addEventListener("message", (e) => {
      const m = JSON.parse(String(e.data));
      if (m.id && pending.has(m.id)) pending.get(m.id)!(m);
      else events.forEach((f) => f(m));
    });
    const send = (method: string, params: Record<string, unknown> = {}) =>
      new Promise<{ result?: Record<string, unknown> }>((r) => {
        pending.set(++id, r);
        ws.send(JSON.stringify({ id, method, params }));
      });
    await send("Page.enable");
    for (const j of jobs) {
      await send("Emulation.setDeviceMetricsOverride", { width: j.width, height: 1200, deviceScaleFactor: 1, mobile: j.width < 500 });
      const loaded = new Promise<void>((r) => events.push((m) => m.method === "Page.loadEventFired" && r()));
      await send("Page.navigate", { url: pathToFileURL(j.file).href });
      await loaded;
      events.length = 0;
      await new Promise((r) => setTimeout(r, 1500)); // web fonts + remote images
      const metrics = (await send("Page.getLayoutMetrics")).result as { cssContentSize: { height: number } };
      const height = Math.ceil(metrics.cssContentSize.height);
      await send("Emulation.setDeviceMetricsOverride", { width: j.width, height, deviceScaleFactor: 1, mobile: j.width < 500 });
      await new Promise((r) => setTimeout(r, 300));
      const shot = (await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true })).result as { data: string };
      writeFileSync(j.png, Buffer.from(shot.data, "base64"));
      console.log(`png  ${j.png} (${j.width}×${height})`);
    }
    ws.close();
  } finally {
    proc.kill();
    await new Promise((r) => setTimeout(r, 500));
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const images = await feedImages();
  const emails = all(images);
  for (const [name, m] of Object.entries(emails)) {
    writeFileSync(join(OUT, `${name}.html`), m.html);
    writeFileSync(join(OUT, `${name}.txt`), `Subject: ${m.subject}\nPreheader: ${m.preheader}\n\n${m.text}\n`);
    console.log(`html ${name}.html — ${m.subject}`);
  }
  if (process.argv.includes("--png")) {
    const shot = (name: string, width: number, suffix = "") => ({ file: join(OUT, `${name}.html`), png: join(OUT, `${name}${suffix}.png`), width });
    await screenshots([
      shot("order-confirmation-en", 640),
      shot("order-confirmation-fr", 640),
      shot("order-confirmation-en", 375, "-375"),
      shot("shipped-fr", 640),
      shot("welcome-fr", 640),
      ...(process.argv.includes("--all")
        ? ["newsletter-confirm-fr", "account-welcome-en", "password-reset-en", "glow-reward-fr", "birthday-fr", "owner-new-order", "welcome-fr"].map((n, i) => shot(n, i === 6 ? 375 : 640, i === 6 ? "-375" : ""))
        : []),
    ]);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
