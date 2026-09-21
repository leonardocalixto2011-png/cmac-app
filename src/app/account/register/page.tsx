import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { serverT } from "@/i18n/server";
import { RegisterForm } from "@/components/account/AuthForms";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("acc.registerTitle"), alternates: { canonical: "/account/register" } };
}

export default async function AccountRegisterPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const session = await auth();
  if (session?.user?.role === "CUSTOMER") redirect("/account");
  const sp = await searchParams;
  return <RegisterForm from={sp.from} />;
}
