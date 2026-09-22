/**
 * Ad pixels (TikTok, Meta, Pinterest) — client side, loaded only after the
 * visitor accepts advertising cookies (Québec Law 25: tracking used for ad
 * profiling needs opt-in). IDs are public build-time env vars; with none set,
 * nothing loads and no cookie banner is shown.
 *
 * content_id = the product slug = the `g:id` of /feeds/google.xml, so the
 * catalog uploaded to TikTok / Meta / Pinterest matches these events.
 */
export const PIXEL_IDS = {
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() || "",
  meta: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "",
  pinterest: process.env.NEXT_PUBLIC_PINTEREST_TAG_ID?.trim() || "",
};

export const anyPixel = () => Boolean(PIXEL_IDS.tiktok || PIXEL_IDS.meta || PIXEL_IDS.pinterest);

export const CONSENT_KEY = "cmac-consent"; // "all" | "essential"

type Fn = (...args: unknown[]) => void;
type W = Window & { ttq?: { track: Fn; page: Fn }; fbq?: Fn; pintrk?: Fn };

export function readConsent(): "all" | "essential" | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

export type TrackItem = { id: string; name: string; priceCents: number; qty?: number };

const dollars = (c: number) => Math.round(c) / 100;

function inject(id: string, code: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.text = code;
  document.head.appendChild(s);
}

/** Official base snippets (TikTok, Meta, Pinterest), minus their auto PageView — we send it on each route change. */
export function loadPixels() {
  const { tiktok, meta, pinterest } = PIXEL_IDS;
  if (tiktok)
    inject(
      "px-tiktok",
      `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load(${JSON.stringify(tiktok)});}(window,document,"ttq");`,
    );
  if (meta)
    inject(
      "px-meta",
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init",${JSON.stringify(meta)});`,
    );
  if (pinterest)
    inject(
      "px-pinterest",
      `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk("load",${JSON.stringify(pinterest)});`,
    );
}

function w(): W | null {
  if (typeof window === "undefined" || readConsent() !== "all") return null;
  loadPixels(); // idempotent: events fired before the loader effect still reach the queue
  return window as W;
}

export function trackPageView(): void {
  const x = w();
  if (!x) return;
  x.ttq?.page();
  x.fbq?.("track", "PageView");
  x.pintrk?.("page");
}

export function trackViewContent(item: TrackItem): void {
  const x = w();
  if (!x) return;
  const value = dollars(item.priceCents);
  x.ttq?.track("ViewContent", { contents: [{ content_id: item.id, content_name: item.name, content_type: "product", price: value }], value, currency: "CAD" });
  x.fbq?.("track", "ViewContent", { content_ids: [item.id], content_name: item.name, content_type: "product", value, currency: "CAD" });
  x.pintrk?.("track", "pagevisit", { product_id: item.id, value, currency: "CAD" });
}

export function trackAddToCart(item: TrackItem): void {
  const x = w();
  if (!x) return;
  const qty = item.qty ?? 1;
  const value = dollars(item.priceCents * qty);
  x.ttq?.track("AddToCart", { contents: [{ content_id: item.id, content_name: item.name, content_type: "product", quantity: qty, price: dollars(item.priceCents) }], value, currency: "CAD" });
  x.fbq?.("track", "AddToCart", { content_ids: [item.id], content_type: "product", contents: [{ id: item.id, quantity: qty }], value, currency: "CAD" });
  x.pintrk?.("track", "addtocart", { value, order_quantity: qty, currency: "CAD", line_items: [{ product_id: item.id, product_quantity: qty }] });
}

export function trackInitiateCheckout(items: TrackItem[]): void {
  const x = w();
  if (!x) return;
  const value = dollars(items.reduce((s, i) => s + i.priceCents * (i.qty ?? 1), 0));
  x.ttq?.track("InitiateCheckout", { contents: items.map((i) => ({ content_id: i.id, content_type: "product", quantity: i.qty ?? 1 })), value, currency: "CAD" });
  x.fbq?.("track", "InitiateCheckout", { content_ids: items.map((i) => i.id), content_type: "product", num_items: items.length, value, currency: "CAD" });
}

/** Fires once per order per browser tab session (reloading the thanks page doesn't double-count). */
export function trackPurchase(orderId: string, totalCents: number, items: TrackItem[]): void {
  const x = w();
  if (!x) return;
  const key = `cmac-tracked-${orderId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* fire anyway */
  }
  const value = dollars(totalCents);
  const qty = items.reduce((s, i) => s + (i.qty ?? 1), 0);
  x.ttq?.track("CompletePayment", { contents: items.map((i) => ({ content_id: i.id, content_type: "product", quantity: i.qty ?? 1, price: dollars(i.priceCents) })), value, currency: "CAD" });
  x.fbq?.("track", "Purchase", { content_ids: items.map((i) => i.id), content_type: "product", contents: items.map((i) => ({ id: i.id, quantity: i.qty ?? 1 })), num_items: qty, value, currency: "CAD" }, { eventID: orderId });
  x.pintrk?.("track", "checkout", { value, order_id: orderId, currency: "CAD", order_quantity: qty, line_items: items.map((i) => ({ product_id: i.id, product_quantity: i.qty ?? 1, product_price: dollars(i.priceCents) })) });
}
