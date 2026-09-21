import { NextResponse } from "next/server";
import { isAdmin, adminListSubscribers } from "@/lib/admin";

export const dynamic = "force-dynamic";

function csvCell(s: string): string {
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV export of newsletter subscribers (admin only; proxy also guards /admin/*). */
export async function GET() {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const rows = await adminListSubscribers();
  const iso = (d: Date | null) => (d ? d.toISOString() : "");
  const lines = [
    "email,status,locale,consent_source,consent_at,confirmed_at,unsubscribed_at,created_at,consent_text",
    ...rows.map((r) =>
      [r.email, r.status, r.locale, r.consentSource ?? "", iso(r.consentAt), iso(r.confirmedAt), iso(r.unsubscribedAt), r.createdAt.toISOString(), r.consentText ?? ""]
        .map(csvCell)
        .join(","),
    ),
  ];
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cmac-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
