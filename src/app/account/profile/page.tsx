import type { Metadata } from "next";
import { requireMember } from "@/lib/account";
import { subscriberStatus } from "@/lib/newsletter";
import { serverT } from "@/i18n/server";
import { ProfileView } from "@/components/account/ProfileView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("acc.profileTitle") };
}

export default async function AccountProfilePage() {
  const { user, customer } = await requireMember("/account/profile");
  const nl = await subscriberStatus(customer.email);
  return (
    <ProfileView
      email={customer.email}
      name={customer.name ?? user.name ?? ""}
      birthMonth={customer.birthMonth}
      birthDay={customer.birthDay}
      emailLocale={customer.locale === "fr" ? "fr" : "en"}
      newsletter={nl === "CONFIRMED" ? "CONFIRMED" : nl === "PENDING" ? "PENDING" : "NONE"}
    />
  );
}
