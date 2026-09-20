import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { adminSignOut } from "@/app/admin/actions";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-[clamp(1.25rem,5vw,2.5rem)] py-10 md:flex-row md:gap-12">
      <aside className="md:w-[210px] md:flex-none">
        <div className="mb-6">
          <p className="font-display text-xl font-semibold">CMAC</p>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sage">Beauty · Admin</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-xl px-3 py-2 text-[0.92rem] text-ink-soft hover:bg-warm-white hover:text-ink">
              {n.label}
            </Link>
          ))}
          <Link href="/" className="rounded-xl px-3 py-2 text-[0.85rem] text-ink-faint hover:text-ink">
            ← View store
          </Link>
        </nav>
        <form action={adminSignOut} className="mt-6">
          <button type="submit" className="btn btn--ghost btn--sm w-full">
            <Icon name="arrow" />
            Sign out
          </button>
        </form>
        <p className="mt-4 px-3 text-[0.72rem] text-ink-faint">{session.user.email}</p>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
