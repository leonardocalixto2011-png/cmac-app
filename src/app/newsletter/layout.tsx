import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="section-pad">
      <div className="wrap">{children}</div>
    </section>
  );
}
