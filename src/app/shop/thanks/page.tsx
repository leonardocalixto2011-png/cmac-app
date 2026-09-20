import type { Metadata } from "next";
import { getOrderByReference } from "@/lib/shop";
import { OrderThanks } from "@/components/shop/OrderThanks";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const ref = order ?? "";
  const found = ref ? await getOrderByReference(ref).catch(() => null) : null;

  return (
    <section className="section-pad">
      <div className="wrap">
        <OrderThanks reference={ref} found={Boolean(found)} />
      </div>
    </section>
  );
}
