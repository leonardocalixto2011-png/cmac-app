import type { Metadata } from "next";
import { serverT } from "@/i18n/server";
import { CartView } from "@/components/shop/CartView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("shop.cartTitle"), robots: { index: false } };
}

export default function CartPage() {
  return (
    <section className="section-pad">
      <div className="wrap">
        <CartView />
      </div>
    </section>
  );
}
