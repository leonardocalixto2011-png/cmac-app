"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { REVIEWS_TAG } from "@/lib/reviews";

export async function moderateReview(id: string, status: "APPROVED" | "REJECTED", incentivized: boolean) {
  await requireAdmin();
  if (status !== "APPROVED" && status !== "REJECTED") throw new Error("BAD_STATUS");
  const r = await prisma.review.update({
    where: { id },
    data: { status, incentivized, approvedAt: status === "APPROVED" ? new Date() : null },
  });
  revalidateTag(REVIEWS_TAG, { expire: 0 });
  revalidatePath("/admin/reviews");
  revalidatePath(`/shop/${r.productSlug}`);
}
