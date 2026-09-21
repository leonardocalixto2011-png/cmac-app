import type { Metadata } from "next";
import { getOrderByReference } from "@/lib/shop";
import { OrderThanks } from "@/components/shop/OrderThanks";
import { auth } from "@/auth";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const ref = order ?? "";
  const [found, session] = await Promise.all([ref ? getOrderByReference(ref).catch(() => null) : null, auth()]);

  return (
    <section className="section-pad">
      <div className="wrap">
        <OrderThanks reference={ref} found={Boolean(found)} signedIn={session?.user?.role === "CUSTOMER"} />
      </div>
    </section>
  );
}
