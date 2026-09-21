import type { Metadata } from "next";
import { findByUnsubscribeToken } from "@/lib/newsletter";
import { serverT } from "@/i18n/server";
import { UnsubscribeView } from "@/components/newsletter/NewsletterPages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("nlp.unsubTitle") };
}

/** Masks an email for display: "ca•••@gmail.com". */
function mask(email: string): string {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}•••@${domain}`;
}

/** Human unsubscribe page. Unsubscribes from the browser on load (one click), with a button fallback. */
export default async function NewsletterUnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const sub = await findByUnsubscribeToken(token).catch(() => null);
  return (
    <UnsubscribeView
      token={sub ? token : null}
      maskedEmail={sub ? mask(sub.email) : ""}
      alreadyUnsubscribed={sub?.status === "UNSUBSCRIBED"}
    />
  );
}
