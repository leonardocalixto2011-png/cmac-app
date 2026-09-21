/**
 * Which external integrations are configured. Reads env PRESENCE only —
 * never returns or logs a value.
 */
const has = (k: string) => Boolean(process.env[k]?.trim());

export const emailConfigured = () => has("RESEND_API_KEY");
export const mailingAddress = (): string | null => process.env.BUSINESS_MAILING_ADDRESS?.trim() || null;
export const cronConfigured = () => has("CRON_SECRET");

export function integrationStatus() {
  return [
    { key: "stripe", label: "Stripe payments", env: "STRIPE_SECRET_KEY", ok: has("STRIPE_SECRET_KEY") },
    { key: "webhook", label: "Stripe webhook", env: "STRIPE_WEBHOOK_SECRET", ok: has("STRIPE_WEBHOOK_SECRET") },
    { key: "resend", label: "Resend email", env: "RESEND_API_KEY", ok: has("RESEND_API_KEY") },
    { key: "from", label: "Sender address", env: "EMAIL_FROM", ok: has("EMAIL_FROM") },
    { key: "address", label: "Mailing address (CASL)", env: "BUSINESS_MAILING_ADDRESS", ok: has("BUSINESS_MAILING_ADDRESS") },
    { key: "cron", label: "Birthday cron", env: "CRON_SECRET", ok: has("CRON_SECRET") },
  ];
}
