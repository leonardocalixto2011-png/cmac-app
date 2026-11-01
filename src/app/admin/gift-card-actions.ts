"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { cancelGiftCard, creditGiftCard } from "@/lib/gift-cards";

/** Stops the code working. The money itself is refunded in Stripe. */
export async function voidGiftCard(id: string) {
  await requireAdmin();
  await cancelGiftCard(id);
  revalidatePath("/admin/gift-cards");
}

/** For an order refunded after being paid with a card. */
export async function creditBackGiftCard(id: string, cents: number) {
  await requireAdmin();
  await creditGiftCard(id, cents);
  revalidatePath("/admin/gift-cards");
}
