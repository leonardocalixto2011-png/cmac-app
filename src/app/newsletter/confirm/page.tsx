import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { serverT } from "@/i18n/server";
import { ConfirmView } from "@/components/newsletter/NewsletterPages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("nlp.confirmedTitle") };
}

/**
 * Double opt-in landing. The page only checks the token; the confirmation
 * itself runs from the browser (ConfirmView) so email link scanners that
 * prefetch URLs can't confirm a subscription on someone's behalf.
 */
export default async function NewsletterConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const sub =
    token && token.length <= 200
      ? await prisma.subscriber.findUnique({ where: { confirmToken: token }, select: { status: true } }).catch(() => null)
      : null;
  const valid = Boolean(sub && sub.status !== "UNSUBSCRIBED");
  return <ConfirmView token={valid ? token : null} />;
}
