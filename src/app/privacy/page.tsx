import type { Metadata } from "next";
import { serverT } from "@/i18n/server";
import { LongForm } from "@/components/LongForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("footer.privacy"), alternates: { canonical: "/privacy" } };
}

export default async function PrivacyPage() {
  const { t } = await serverT();
  return (
    <section className="section-pad">
      <div className="wrap">
        <LongForm page="privacy" eyebrow={t("footer.legal")} />
      </div>
    </section>
  );
}
