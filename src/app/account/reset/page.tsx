import type { Metadata } from "next";
import { serverT } from "@/i18n/server";
import { ResetForms } from "@/components/account/AuthForms";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("acc.resetTitle") };
}

export default async function AccountResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const sp = await searchParams;
  return <ResetForms token={sp.token ?? null} />;
}
