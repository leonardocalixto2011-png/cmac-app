import type { Metadata } from "next";
import { serverT } from "@/i18n/server";
import { LongForm } from "@/components/LongForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("footer.terms"), alternates: { canonical: "/terms" } };
}

export default async function TermsPage() {
  const { t } = await serverT();
  return (
    <section className="section-pad">
      <div className="wrap">
        <LongForm page="terms" eyebrow={t("footer.legal")} />
      </div>
    </section>
  );
}
