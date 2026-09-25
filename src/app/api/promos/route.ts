import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { PROMOS } from "@/lib/promos";

export const revalidate = 300;

/**
 * Public, read-only: which seasonal codes exist in Stripe, with their expiry.
 * The codes themselves are already public (they're printed in the promo bar
 * when their campaign runs); this only confirms they were created.
 */
export async function GET() {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "stripe not configured" }, { status: 503 });
  const out = [];
  for (const p of PROMOS) {
    if (!p.code) continue;
    const found = await stripe.promotionCodes.list({ code: p.code, limit: 1 }).catch(() => null);
    const pc = found?.data[0];
    out.push({
      campaign: p.id,
      code: p.code,
      percentOff: p.percentOff,
      exists: Boolean(pc),
      active: pc?.active ?? false,
      expiresAt: pc?.expires_at ? new Date(pc.expires_at * 1000).toISOString() : null,
      campaignEnds: p.endsAt,
    });
  }
  return NextResponse.json({ codes: out });
}
