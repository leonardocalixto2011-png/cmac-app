import type { Metadata } from "next";
import { serverT } from "@/i18n/server";
import { CartView } from "@/components/shop/CartView";
import { currentMemberTier } from "@/lib/account";
import { subscriberStatus } from "@/lib/newsletter";
import { listProducts, restoreCartLines } from "@/lib/shop";
import { openDrop } from "@/lib/drops";
import type { CartAddon } from "@/components/shop/CartView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("shop.cartTitle"), robots: { index: false } };
}

export default async function CartPage({ searchParams }: { searchParams: Promise<{ restore?: string }> }) {
  const { restore } = await searchParams;
  const restored = restore ? await restoreCartLines(restore).catch(() => null) : null;
  const drop = await openDrop().catch(() => null);
  // Member perks are resolved server-side from the session; checkout re-checks them.
  const member = await currentMemberTier().catch(() => null);
  const sub = member ? await subscriberStatus(member.email).catch(() => null) : null;
  // One-click add-ons for the free-shipping nudge: single products without options, under $40.
  const addons: CartAddon[] = (await listProducts("the-ritual").catch(() => []))
    .filter((p) => p.options.length === 0 && p.priceCents <= 4000)
    .map((p) => ({ slug: p.slug, nameEn: p.nameEn, nameFr: p.nameFr, priceCents: p.priceCents, image: p.images[0] ?? null, tags: p.tags }));
  return (
    <section className="section-pad">
      <div className="wrap">
        <CartView
          member={member ? { tier: member.tier.id, freeShippingFromCents: member.tier.freeShippingFromCents, quarterPointsPerDollar: member.tier.quarterPointsPerDollar } : null}
          subscribed={sub === "CONFIRMED" || sub === "PENDING"}
          addons={addons}
          restore={restored}
          convoy={
            drop
              ? {
                  code: drop.code,
                  closesAt: drop.closesAt.toISOString(),
                  deliveryFrom: drop.deliveryFrom.toISOString(),
                  deliveryTo: drop.deliveryTo.toISOString(),
                  members: drop.members,
                }
              : null
          }
        />
      </div>
    </section>
  );
}
