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
  const lines = ["email,locale,created_at", ...rows.map((r) => [r.email, r.locale, r.createdAt.toISOString()].map(csvCell).join(","))];
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cmac-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
