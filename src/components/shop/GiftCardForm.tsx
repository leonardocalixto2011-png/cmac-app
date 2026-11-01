"use client";

import { useState, useTransition } from "react";
import { buyGiftCard, checkGiftCardBalance } from "@/app/gift-card/actions";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { christmasPhase } from "@/lib/season";
import { formatMoneyFromCents, formatWholeDollars } from "@/lib/utils";
import { GIFT_CARD_AMOUNTS, GIFT_CARD_DEFAULT_CENTS, GIFT_CARD_MAX } from "@/lib/gift-card-rules";

const COPY = {
  en: {
    card: "Gift card",
    for: "For",
    from: "From",
    amount: "Amount",
    toName: "Their name",
    toEmail: "Their email",
    toEmailHint: "Leave it empty to receive the card yourself, then print or forward it.",
    fromName: "Your name",
    message: "A few words",
    optional: "optional",
    later: "Send it on a chosen day",
    laterHint: "It leaves around 9 a.m., Montréal time. You get a receipt with the code right away.",
    day: "Day",
    pay: (amount: string) => `Continue to payment · ${amount}`,
    paying: "One moment…",
    secure: "Secure payment by credit card with Stripe. Your name and message appear on the card as typed.",
    badEmail: "That email address doesn't look right.",
    invalid: "Please check the amount and the date.",
    tooMany: "Too many tries for now. Please wait a little and try again.",
  },
  fr: {
    card: "Carte-cadeau",
    for: "Pour",
    from: "De la part de",
    amount: "Montant",
    toName: "Son nom",
    toEmail: "Son courriel",
    toEmailHint: "Laissez vide pour recevoir la carte vous-même, puis l'imprimer ou la transférer.",
    fromName: "Votre nom",
    message: "Quelques mots",
    optional: "facultatif",
    later: "L'envoyer le jour choisi",
    laterHint: "Elle part vers 9 h, heure de Montréal. Vous recevez tout de suite un reçu avec le code.",
    day: "Jour",
    pay: (amount: string) => `Continuer vers le paiement · ${amount}`,
    paying: "Un instant…",
    secure: "Paiement sécurisé par carte de crédit avec Stripe. Votre nom et votre message paraissent sur la carte tels que vous les écrivez.",
    badEmail: "Cette adresse courriel semble incorrecte.",
    invalid: "Vérifiez le montant et la date.",
    tooMany: "Trop d'essais pour l'instant. Attendez un peu et réessayez.",
  },
} as const;

const dayOf = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Toronto" });

export function GiftCardForm() {
  const { t, locale } = useLocale();
  const c = COPY[locale];
  const [amountCents, setAmount] = useState<number>(GIFT_CARD_DEFAULT_CENTS);
  const [f, setF] = useState({ toName: "", toEmail: "", fromName: "", message: "" });
  const [later, setLater] = useState(false);
  // In season the obvious day is Christmas morning.
  const [sendOn, setSendOn] = useState(() => (christmasPhase() ? `${new Date().getFullYear()}-12-25` : ""));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const amount = formatWholeDollars(amountCents, locale);
  const [tomorrow] = useState(() => dayOf(new Date(Date.now() + 864e5)));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await buyGiftCard({ amountCents, ...f, sendOn: later ? sendOn : "" }, locale);
      if (res.ok) {
        window.location.href = res.url;
        return;
      }
      if (res.error === "BAD_EMAIL") setError(c.badEmail);
      else if (res.error === "INVALID") setError(c.invalid);
      else if (res.error === "TOO_MANY") setError(c.tooMany);
      else if (res.error === "PAYMENT_UNAVAILABLE") setError(t("shop.payUnavailable"));
      else setError(t("shop.checkoutFailed"));
    });
  }

  return (
    <div className="gc">
      <div className="gc-preview">
        <div className="gc-card" aria-hidden="true">
          <div className="gc-card__top">
            <span className="gc-card__brand">CMAC Beauty</span>
            <span className="gc-card__kind">{c.card}</span>
          </div>
          <p className="gc-card__amount">{amount}</p>
          <div className="gc-card__names">
            {f.toName.trim() && (
              <span>
                {c.for} {f.toName.trim()}
              </span>
            )}
            {f.fromName.trim() && (
              <span>
                {c.from} {f.fromName.trim()}
              </span>
            )}
          </div>
        </div>
        {f.message.trim() && <p className="gc-note">{f.message.trim()}</p>}
      </div>

      <form onSubmit={submit} className="gc-form">
        <fieldset className="gc-amounts">
          <legend>{c.amount}</legend>
          {GIFT_CARD_AMOUNTS.map((value) => (
            <label key={value} className={value === amountCents ? "is-on" : undefined}>
              <input type="radio" name="amount" checked={value === amountCents} onChange={() => setAmount(value)} />
              {formatWholeDollars(value, locale)}
            </label>
          ))}
        </fieldset>

        <div className="gc-row">
          <label className="gc-field">
            {c.toName}
            <input className="field" type="text" maxLength={GIFT_CARD_MAX.name} autoComplete="off" value={f.toName} onChange={(e) => setF({ ...f, toName: e.target.value })} />
          </label>
          <label className="gc-field">
            {c.fromName}
            <input className="field" type="text" maxLength={GIFT_CARD_MAX.name} autoComplete="name" value={f.fromName} onChange={(e) => setF({ ...f, fromName: e.target.value })} />
          </label>
        </div>
        <label className="gc-field">
          <span>
            {c.toEmail} <em>({c.optional})</em>
          </span>
          <input className="field" type="email" maxLength={254} autoComplete="off" value={f.toEmail} onChange={(e) => setF({ ...f, toEmail: e.target.value })} />
          <small>{c.toEmailHint}</small>
        </label>
        <label className="gc-field">
          <span>
            {c.message} <em>({c.optional})</em>
          </span>
          <textarea className="field" rows={3} maxLength={GIFT_CARD_MAX.message} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
        </label>

        <label className="gc-check">
          <input type="checkbox" checked={later} onChange={(e) => setLater(e.target.checked)} />
          {c.later}
        </label>
        {later && (
          <label className="gc-field">
            {c.day}
            <input className="field" type="date" required min={tomorrow} value={sendOn} onChange={(e) => setSendOn(e.target.value)} />
            <small>{c.laterHint}</small>
          </label>
        )}

        {error && (
          <p className="gc-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn w-full" disabled={pending}>
          {pending ? c.paying : c.pay(amount)}
          {!pending && <Icon name="arrow" />}
        </button>
        <p className="gc-secure">{c.secure}</p>
      </form>
    </div>
  );
}

const BALANCE = {
  en: { title: "Check a balance", label: "Your code", go: "Check", left: (a: string) => `Balance: ${a}`, none: "We can't find that code. A code replaced after a partial use no longer works: use the newest one in your email.", tooMany: "Too many tries for now. Please wait a little and try again." },
  fr: { title: "Vérifier un solde", label: "Votre code", go: "Vérifier", left: (a: string) => `Solde : ${a}`, none: "Ce code est introuvable. Un code remplacé après un achat partiel ne fonctionne plus : utilisez le plus récent reçu par courriel.", tooMany: "Trop d'essais pour l'instant. Attendez un peu et réessayez." },
} as const;

export function GiftCardBalance() {
  const { locale } = useLocale();
  const c = BALANCE[locale];
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await checkGiftCardBalance(code);
      setResult(res.ok ? c.left(formatMoneyFromCents(res.balanceCents, locale)) : res.error === "TOO_MANY" ? c.tooMany : c.none);
    });
  }

  return (
    <form onSubmit={submit} className="gc-balance">
      <h2>{c.title}</h2>
      <div className="gc-balance__row">
        <input className="field" type="text" required aria-label={c.label} placeholder="CADEAU-XXXX-XXXX" autoComplete="off" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit" className="btn btn--ghost" disabled={pending}>
          {c.go}
        </button>
      </div>
      {result && (
        <p className="gc-balance__result" role="status">
          {result}
        </p>
      )}
    </form>
  );
}
