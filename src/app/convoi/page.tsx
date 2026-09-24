import type { Metadata } from "next";
import Link from "next/link";
import { serverLocale } from "@/i18n/server";
import { openDrop } from "@/lib/drops";
import { SHIPPING } from "@/lib/brand";
import { formatMoneyFromCents } from "@/lib/utils";
import { JsonLd, breadcrumbLd, faqLd } from "@/components/JsonLd";

export const dynamic = "force-dynamic";

const COPY = {
  en: {
    eyebrow: "The Planners",
    title: "The convoy: plan ahead, save together",
    lead: "Strangers, saving on the same trip. Pick the shared dispatch date instead of ordering alone, and the shipping fee disappears.",
    how: "How it works",
    steps: [
      "You shop normally and, in the cart, tick “join the convoy”.",
      "Your order waits for the convoy's dispatch date — the 1st or the 15th, whichever comes first.",
      "On that morning we place every convoy order with our supplier at once, which is where the saving comes from.",
      "Your parcel then travels on its own, to your address, with your own tracking number.",
    ],
    honestTitle: "What we're not doing",
    honest: [
      "We do not put several customers in one box. Everyone has a different address, so every parcel stays separate and private. What is shared is the buying day, not the package.",
      "The saving is real but modest: it is the shipping fee we stop charging you. We can afford it because ordering everything on the same day reaches the supplier's quantity prices and because we handle one batch instead of twenty.",
      "The trade is time. A convoy order leaves later than a solo order. We show the delivery window before you pay, and again in your confirmation.",
    ],
    who: "Who it's for",
    whoBody:
      "Anyone who is not in a hurry: a gift bought weeks ahead, a restock, a first order you want to try without paying shipping. If you need it fast, order solo — same products, same price, shipping added.",
    cta: "See the sets",
    faqTitle: "Questions",
  },
  fr: {
    eyebrow: "Les planificatrices",
    title: "Le convoi : planifier et économiser",
    lead: "Des inconnues qui économisent sur le même voyage. Choisissez la date d'expédition partagée au lieu de commander seule, et les frais de livraison disparaissent.",
    how: "Comment ça marche",
    steps: [
      "Vous magasinez normalement et, dans le panier, vous cochez « rejoindre le convoi ».",
      "Votre commande attend la date du convoi : le 1er ou le 15, selon ce qui arrive en premier.",
      "Ce matin-là, on passe toutes les commandes du convoi chez notre fournisseur d'un seul coup : c'est de là que vient l'économie.",
      "Votre colis voyage ensuite seul, jusqu'à votre adresse, avec votre propre numéro de suivi.",
    ],
    honestTitle: "Ce qu'on ne fait pas",
    honest: [
      "On ne met pas plusieurs clientes dans la même boîte. Chacune a son adresse, donc chaque colis reste distinct et privé. Ce qui est partagé, c'est la journée d'achat, pas l'emballage.",
      "L'économie est réelle mais modeste : ce sont les frais de livraison qu'on cesse de vous facturer. On peut se le permettre parce que commander tout la même journée atteint les prix de quantité du fournisseur et qu'on traite un seul lot au lieu de vingt.",
      "Ce que ça coûte, c'est du temps. Une commande en convoi part plus tard qu'une commande seule. On affiche la fenêtre de livraison avant le paiement, et de nouveau dans votre confirmation.",
    ],
    who: "Pour qui",
    whoBody:
      "Pour celles qui ne sont pas pressées : un cadeau acheté des semaines d'avance, un réapprovisionnement, une première commande qu'on veut essayer sans payer la livraison. Si c'est urgent, commandez seule : mêmes produits, même prix, livraison en sus.",
    cta: "Voir les coffrets",
    faqTitle: "Questions",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await serverLocale();
  const c = COPY[locale];
  return {
    title: c.title,
    description: c.lead,
    alternates: { canonical: "/convoi", languages: { "en-CA": "/convoi", "fr-CA": "/convoi?lang=fr", "x-default": "/convoi" } },
  };
}

export default async function ConvoyPage() {
  const locale = await serverLocale();
  const fr = locale === "fr";
  const c = COPY[locale];
  const drop = await openDrop().catch(() => null);
  const date = (d: Date) => d.toLocaleDateString(fr ? "fr-CA" : "en-CA", { month: "long", day: "numeric" });
  const fee = formatMoneyFromCents(SHIPPING.flatCents, locale);

  const faq = fr
    ? [
        { q: "Combien j'économise exactement ?", a: `Les frais de livraison, soit ${fee}. Il n'y a pas de montant minimum : même une commande de 15 $ voyage sans frais dans le convoi.` },
        { q: "Est-ce que quelqu'un verra ce que j'ai commandé ?", a: "Non. Les colis sont préparés séparément et personne ne voit votre commande, votre nom ni votre adresse. On affiche seulement le nombre de participantes." },
        { q: "Et si je change d'idée après avoir payé ?", a: "Écrivez-nous avant la date du convoi et on annule et rembourse au complet, puisque la commande n'est pas encore passée chez le fournisseur." },
        { q: "Pourquoi ne pas simplement offrir la livraison gratuite à tout le monde ?", a: "Parce qu'elle n'est pas gratuite : elle nous coûte entre 5 $ et 9 $ par colis. Le convoi, lui, nous fait économiser assez pour l'absorber. Offrir la livraison sur chaque commande voudrait dire monter les prix pour tout le monde." },
        { q: "Puis-je combiner avec un code promo ?", a: "Oui. Le convoi touche la livraison, le code touche le prix des produits." },
      ]
    : [
        { q: "How much do I actually save?", a: `The shipping fee, ${fee}. There is no minimum: even a $15 order travels free inside a convoy.` },
        { q: "Will anyone see what I ordered?", a: "No. Parcels are packed separately and nobody sees your order, your name or your address. We only publish the number of participants." },
        { q: "What if I change my mind after paying?", a: "Write to us before the convoy date and we cancel and refund in full, since the order has not been placed with the supplier yet." },
        { q: "Why not give free shipping to everyone?", a: "Because it isn't free: it costs us $5 to $9 per parcel. A convoy saves us enough to absorb it. Giving it on every order would mean raising prices for everyone." },
        { q: "Can I combine it with a promo code?", a: "Yes. The convoy covers shipping, the code covers the products." },
      ];

  return (
    <section className="section-pad">
      <JsonLd data={faqLd(faq)} />
      <JsonLd data={breadcrumbLd([{ name: c.title, path: "/convoi" }])} />
      <div className="wrap mx-auto max-w-[760px]">
        <span className="eyebrow">{c.eyebrow}</span>
        <h1 className="mt-3 text-[clamp(2rem,1.5rem+2.4vw,3.2rem)]">{c.title}</h1>
        <p className="mt-4 text-[1.08rem] leading-relaxed text-ink-soft">{c.lead}</p>

        {drop && (
          <div className="mt-8 rounded-2xl bg-warm-white p-5">
            <p className="font-ui text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-terra">
              {fr ? "Prochain convoi" : "Next convoy"}
            </p>
            <p className="mt-2 font-display text-[1.6rem]">
              {fr ? `Départ le ${date(drop.ordersOn)}` : `Leaves ${date(drop.ordersOn)}`}
            </p>
            <dl className="mt-3 flex flex-col gap-1 text-[0.95rem] text-ink-soft">
              <div className="flex justify-between gap-4">
                <dt>{fr ? "Dernier moment pour embarquer" : "Last moment to join"}</dt>
                <dd className="font-semibold text-ink">{date(drop.closesAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{fr ? "Livraison prévue" : "Expected delivery"}</dt>
                <dd className="font-semibold text-ink">
                  {date(drop.deliveryFrom)} – {date(drop.deliveryTo)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{fr ? "Participantes" : "Participants"}</dt>
                <dd className="font-semibold text-ink">{drop.members}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{fr ? "Vous économisez" : "You save"}</dt>
                <dd className="font-semibold text-terra">{fee}</dd>
              </div>
            </dl>
            <Link href="/collections/sets" className="btn mt-5">
              {c.cta}
            </Link>
          </div>
        )}

        <h2 className="mt-12 text-[1.6rem]">{c.how}</h2>
        <ol className="mt-4 flex flex-col gap-3">
          {c.steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-[1rem] leading-relaxed text-ink-soft">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-terra text-[0.85rem] font-semibold text-white">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 text-[1.6rem]">{c.honestTitle}</h2>
        <ul className="mt-4 flex flex-col gap-3 text-[1rem] leading-relaxed text-ink-soft">
          {c.honest.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>

        <h2 className="mt-12 text-[1.6rem]">{c.who}</h2>
        <p className="mt-3 text-[1rem] leading-relaxed text-ink-soft">{c.whoBody}</p>

        <h2 className="mt-12 text-[1.6rem]">{c.faqTitle}</h2>
        <dl className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {faq.map((f) => (
            <div key={f.q} className="py-4">
              <dt className="font-display text-[1.08rem]">{f.q}</dt>
              <dd className="mt-1 text-[0.98rem] leading-relaxed text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
