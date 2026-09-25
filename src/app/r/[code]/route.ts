import { NextResponse, type NextRequest } from "next/server";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_DAYS, resolveReferral } from "@/lib/referrals";

export const dynamic = "force-dynamic";

/**
 * Referral landing: /r/AMIE-XXXX remembers the code for 30 days (checkout
 * applies it) and sends the friend to the shop. Unknown codes just go to the
 * shop without a cookie, so a mistyped link never errors.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const ref = await resolveReferral(code).catch(() => null);
  const url = new URL(ref ? "/shop?ref=1" : "/shop", req.nextUrl.origin);
  const res = NextResponse.redirect(url, 302);
  if (ref) {
    res.cookies.set(REFERRAL_COOKIE, ref.code, {
      path: "/",
      maxAge: 60 * 60 * 24 * REFERRAL_COOKIE_DAYS,
      sameSite: "lax",
      // Read by the promo bar (client) to announce the friend's discount.
      httpOnly: false,
    });
  }
  return res;
}
