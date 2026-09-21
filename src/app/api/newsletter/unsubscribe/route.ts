import { NextRequest, NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/newsletter";
import { siteUrl } from "@/lib/brand";

export const dynamic = "force-dynamic";

/**
 * RFC 8058 one-click unsubscribe target (List-Unsubscribe-Post). Mail clients
 * POST here with "List-Unsubscribe=One-Click". A GET (someone opening the
 * header link) redirects to the human unsubscribe page instead.
 */
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const ok = await unsubscribeByToken(token);
  return NextResponse.json({ unsubscribed: ok }, { status: ok ? 200 : 404 });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  return NextResponse.redirect(`${siteUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`);
}
