"use client";

import { useState, useTransition } from "react";
import { sendCampaignTest, sendCampaignToAll, type CampaignInput } from "@/app/admin/newsletter-actions";

const EMPTY: CampaignInput = { subjectEn: "", subjectFr: "", preheaderEn: "", preheaderFr: "", bodyEn: "", bodyFr: "", productSlugs: [] };

/**
 * Campaign composer: EN + FR subject / preheader / Markdown body (both required
 * — French subscribers get French), up to 4 highlighted products (cards with
 * UTM links), "Send test to me", then "Send to all confirmed".
 */
export function CampaignComposer({
  disabled,
  confirmed,
  products,
}: {
  disabled: boolean;
  confirmed: number;
  products: { slug: string; name: string }[];
}) {
  const [f, setF] = useState<CampaignInput>(EMPTY);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [tested, setTested] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof CampaignInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  function toggleProduct(slug: string) {
    const has = f.productSlugs.includes(slug);
    if (!has && f.productSlugs.length >= 4) return;
    setF({ ...f, productSlugs: has ? f.productSlugs.filter((s) => s !== slug) : [...f.productSlugs, slug] });
  }

  const label = "font-ui text-[0.78rem] font-semibold text-ink-soft";

  return (
    <form
      className="flex flex-col gap-5 rounded-2xl bg-warm-white p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!window.confirm(`Send "${f.subjectEn}" to ${confirmed} confirmed subscriber${confirmed === 1 ? "" : "s"} now? This can't be undone.`)) return;
        setMsg(null);
        start(async () => {
          const res = await sendCampaignToAll(f);
          setMsg(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
          if (res.ok) {
            setF(EMPTY);
            setTested(false);
          }
        });
      }}
    >
      <fieldset disabled={disabled || pending} className="grid gap-5 md:grid-cols-2">
        {(["En", "Fr"] as const).map((L) => (
          <div key={L} className="flex flex-col gap-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-terra">{L === "En" ? "English" : "Français"}</p>
            <label className="flex flex-col gap-1">
              <span className={label}>Subject *</span>
              <input className="field" maxLength={150} required value={f[`subject${L}`]} onChange={set(`subject${L}`)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>Preheader (inbox preview line)</span>
              <input className="field" maxLength={150} value={f[`preheader${L}`]} onChange={set(`preheader${L}`)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>Body (Markdown) *</span>
              <textarea className="field min-h-[220px] font-mono text-[0.85rem]" required value={f[`body${L}`]} onChange={set(`body${L}`)} />
            </label>
          </div>
        ))}
      </fieldset>
      <p className="text-[0.78rem] text-ink-faint">
        Markdown: <code># Heading</code>, <code>**bold**</code>, <code>*italic*</code>, <code>[link](https://…)</code>, lines starting with <code>- </code> for
        lists, blank line between paragraphs. Keep copy cosmetic / appearance-only. The CASL footer and unsubscribe link are added automatically.
      </p>

      <fieldset disabled={disabled || pending}>
        <legend className={label}>Product highlights (up to 4) · {f.productSlugs.length}/4</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {products.map((p) => {
            const on = f.productSlugs.includes(p.slug);
            return (
              <button
                type="button"
                key={p.slug}
                aria-pressed={on}
                onClick={() => toggleProduct(p.slug)}
                className="pill text-[0.78rem]"
                disabled={!on && f.productSlugs.length >= 4}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`rounded-2xl px-4 py-3 text-sm ${msg.ok ? "bg-sage/10 text-sage" : "bg-terra/10 text-terra"}`}>
          {msg.text}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={disabled || pending}
          onClick={() => {
            setMsg(null);
            start(async () => {
              const res = await sendCampaignTest(f);
              setMsg(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
              if (res.ok) setTested(true);
            });
          }}
        >
          Send test to me (EN + FR)
        </button>
        <button type="submit" className="btn btn--sm" disabled={disabled || pending || !tested || confirmed === 0}>
          {pending ? "Sending…" : `Send to all confirmed (${confirmed})`}
        </button>
        {!tested && !disabled && <span className="text-[0.78rem] text-ink-faint">Send a test first to unlock the full send.</span>}
      </div>
    </form>
  );
}
