import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { serverT } from "@/i18n/server";
import { CustomerLoginForm } from "@/components/account/AuthForms";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("acc.loginBtn"), alternates: { canonical: "/account/login" } };
}

export default async function AccountLoginPage({ searchParams }: { searchParams: Promise<{ from?: string; reset?: string }> }) {
  const session = await auth();
  if (session?.user?.role === "CUSTOMER") redirect("/account");
  const sp = await searchParams;
  return <CustomerLoginForm from={sp.from} resetDone={sp.reset === "1"} />;
}
