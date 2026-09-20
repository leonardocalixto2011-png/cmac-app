import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin — Sign in", robots: { index: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ from?: string; error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const sp = await searchParams;

  return (
    <section className="section-pad">
      <div className="wrap mx-auto max-w-[400px]">
        <span className="eyebrow">CMAC Beauty</span>
        <h1 className="mt-3 text-[clamp(1.8rem,1.4rem+2vw,2.6rem)]">Admin</h1>
        <p className="mt-2 text-sm text-ink-soft">Sign in reserved for the store owner.</p>
        <LoginForm from={sp.from} initialError={sp.error} />
      </div>
    </section>
  );
}
