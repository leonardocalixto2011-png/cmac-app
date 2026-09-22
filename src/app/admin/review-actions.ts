"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function moderateReview(id: string, status: "APPROVED" | "REJECTED", incentivized: boolean) {
  await requireAdmin();
  if (status !== "APPROVED" && status !== "REJECTED") throw new Error("BAD_STATUS");
  const r = await prisma.review.update({
    where: { id },
    data: { status, incentivized, approvedAt: status === "APPROVED" ? new Date() : null },
  });
  revalidatePath("/admin/reviews");
  revalidatePath(`/shop/${r.productSlug}`);
}
