import type { Metadata } from "next";
import { serverT } from "@/i18n/server";
import { LongForm } from "@/components/LongForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("footer.shipping"), alternates: { canonical: "/shipping-returns" } };
}

export default async function ShippingReturnsPage() {
  const { t } = await serverT();
  return (
    <section className="section-pad">
      <div className="wrap">
        <LongForm page="shipping-returns" eyebrow={t("footer.help")} />
      </div>
    </section>
  );
}
