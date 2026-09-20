import type { Metadata } from "next";
import { serverT } from "@/i18n/server";
import { ContactForm } from "@/components/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("contact.title"), description: t("contact.lead"), alternates: { canonical: "/contact" } };
}

export default function ContactPage() {
  return (
    <section className="section-pad">
      <div className="wrap">
        <ContactForm />
      </div>
    </section>
  );
}
