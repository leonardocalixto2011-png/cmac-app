import type { Metadata } from "next";
import { serverT } from "@/i18n/server";
import { LongForm } from "@/components/LongForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("footer.refund"), alternates: { canonical: "/refund-policy" } };
}

export default async function RefundPolicyPage() {
  const { t } = await serverT();
  return (
    <section className="section-pad">
      <div className="wrap">
        <LongForm page="refund-policy" eyebrow={t("footer.legal")} />
      </div>
    </section>
  );
}
