import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation, sendOwnerOrderNotice } from "@/lib/email";
import { normalizeLocale } from "@/i18n/messages";

/**
 * Stripe webhook — `checkout.session.completed` marks the order PAID, stores
 * the collected shipping address + name, then emails the customer (EN/FR per
 * order locale) and the owner. Register this URL in the CMAC Stripe account:
 *   https://cmacbeauty.ca/api/stripe/webhook
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", secret);
  } catch (err) {
    console.error("[stripe] webhook signature check failed", err);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) return NextResponse.json({ received: true });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== "PENDING") return NextResponse.json({ received: true });

    // Stripe moved shipping details between `shipping_details` and
    // `collected_information.shipping_details` across API versions.
    const s = session as unknown as {
      shipping_details?: unknown;
      collected_information?: { shipping_details?: unknown } | null;
    };
    const shipping = s.collected_information?.shipping_details ?? s.shipping_details ?? null;
    const shippingObj = shipping as { name?: string | null } | null;
    const contactEmail = session.customer_details?.email ?? order.contactEmail;
    const contactName = shippingObj?.name ?? session.customer_details?.name ?? null;
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

    const customer = contactEmail
      ? await prisma.customer.upsert({
          where: { email: contactEmail.toLowerCase() },
          update: { name: contactName ?? undefined, locale: order.locale },
          create: { email: contactEmail.toLowerCase(), name: contactName, locale: order.locale },
        })
      : null;

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        contactEmail,
        contactName,
        shippingJson: (shipping as object) ?? undefined,
        stripePaymentIntentId: paymentIntentId ?? undefined,
        customerId: customer?.id,
      },
    });
    console.info(`[shop] order ${updated.reference} paid`);

    const data = {
      reference: updated.reference,
      locale: normalizeLocale(updated.locale),
      contactEmail: updated.contactEmail,
      contactName: updated.contactName,
      items: updated.items,
      subtotalCents: updated.subtotalCents,
      shippingCents: updated.shippingCents,
      totalCents: updated.totalCents,
      shippingJson: updated.shippingJson,
    };
    await Promise.all([sendOrderConfirmation(data), sendOwnerOrderNotice(data)]);
  }

  return NextResponse.json({ received: true });
}
