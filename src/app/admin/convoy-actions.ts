"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import type { DropStatus } from "@prisma/client";

const ALLOWED: DropStatus[] = ["OPEN", "CLOSED", "ORDERED", "SHIPPED"];

/** Move a convoy along: OPEN → CLOSED → ORDERED → SHIPPED. Closing stops new joins. */
export async function setDropStatus(code: string, status: DropStatus) {
  await requireAdmin();
  if (!ALLOWED.includes(status)) throw new Error("BAD_STATUS");
  await prisma.drop.update({ where: { code }, data: { status } });
  revalidatePath("/admin/convoys");
  revalidatePath("/convoi");
  revalidatePath("/cart");
}
