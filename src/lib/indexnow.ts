import { siteUrl } from "@/lib/brand";
import { COLLECTIONS, listProducts } from "@/lib/shop";
import { JOURNAL_SLUGS } from "@/content/journal";

/**
 * Public by design: IndexNow verifies ownership by serving this exact string at
 * /<key>.txt, so it is not a secret and must match public/<key>.txt.
 */
const KEY = "eb364dbf8fe13021af9d85291216dfd0";

/** Pages worth an engine's attention: the ones that sell or answer a question. */
async function urls(base: string): Promise<string[]> {
  const list = [
    `${base}/`,
    `${base}/shop`,
    `${base}/journal`,
    `${base}/about`,
    `${base}/faq`,
    `${base}/glow-club`,
    `${base}/pro`,
    `${base}/entreprises`,
    ...COLLECTIONS.map((h) => `${base}/collections/${h}`),
    ...JOURNAL_SLUGS.map((s) => `${base}/journal/${s}`),
  ];
  try {
    const rows = await listProducts();
    list.push(...rows.map((p) => `${base}/shop/${p.slug}`));
  } catch {
    /* DB unavailable: the static routes are still worth submitting */
  }
  return list;
}

/**
 * Tell Bing (and therefore assistants that search through it) that our pages
 * changed, instead of waiting weeks for a recrawl. The key file has been served
 * since the site launched but nothing ever submitted anything, so prices and
 * guides went stale in the index for as long as it took Bing to come back.
 *
 * Safe to run daily: IndexNow is idempotent, accepts up to 10,000 URLs per
 * call, and a 200 or 202 both mean accepted. Anything else we log and ignore —
 * a search ping must never be able to fail the cron that sends real email.
 */
export async function submitIndexNow(): Promise<{ submitted: number; status: number } | { error: string }> {
  const base = siteUrl().replace(/\/$/, "");
  const host = new URL(base).host;
  const urlList = await urls(base);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: KEY, keyLocation: `${base}/${KEY}.txt`, urlList }),
  });
  if (res.status !== 200 && res.status !== 202) {
    console.warn(`[indexnow] ${res.status} ${await res.text().catch(() => "")}`.trim());
    return { error: `status ${res.status}` };
  }
  return { submitted: urlList.length, status: res.status };
}
