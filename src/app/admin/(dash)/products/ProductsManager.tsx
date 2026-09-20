"use client";

import { useState, useTransition } from "react";
import { createProduct, updateProduct, deleteProduct, type ProductInput } from "@/app/admin/actions";

type P = ProductInput & { slug: string };

const BLANK: ProductInput = {
  nameEn: "",
  nameFr: "",
  tagline: "",
  taglineFr: "",
  descriptionEn: "",
  descriptionFr: "",
  priceDollars: 0,
  compareAtDollars: null,
  tagsCsv: "",
  imagesCsv: "",
  optionsJson: "[]",
  active: true,
  supplierUrl: "",
  supplierSku: "",
  shippingNote: "",
};

export function ProductsManager({ products }: { products: P[] }) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {products.map((p) => (
        <ProductForm key={p.slug} initial={p} slug={p.slug} />
      ))}
      {creating ? (
        <ProductForm initial={{ ...BLANK }} onDone={() => setCreating(false)} />
      ) : (
        <button type="button" onClick={() => setCreating(true)} className="btn btn--ghost btn--sm self-start">
          + New product
        </button>
      )}
    </div>
  );
}

function ProductForm({ initial, slug, onDone }: { initial: ProductInput; slug?: string; onDone?: () => void }) {
  const [f, setF] = useState<ProductInput>(initial);
  const [open, setOpen] = useState(!slug);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (p: Partial<ProductInput>) => setF((v) => ({ ...v, ...p }));

  function save() {
    setMsg(null);
    start(async () => {
      try {
        const payload: ProductInput = {
          ...f,
          priceDollars: Number(f.priceDollars),
          compareAtDollars: f.compareAtDollars != null && f.compareAtDollars !== ("" as unknown) ? Number(f.compareAtDollars) : null,
        };
        if (slug) await updateProduct(slug, payload);
        else {
          await createProduct(payload);
          onDone?.();
        }
        setMsg("Saved ✓");
        setTimeout(() => setMsg(null), 1500);
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-warm-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-left">
          <span className="font-display text-[1.1rem] font-medium">{f.nameEn || "New product"}</span>
          {slug && <span className="ml-2 text-[0.72rem] text-ink-faint">/shop/{slug}</span>}
          {!f.active && <span className="ml-2 rounded-full bg-cream-2 px-2 text-[0.68rem] font-semibold uppercase text-ink-faint">hidden</span>}
        </button>
        <span className="text-[0.85rem] text-ink-soft">
          ${Number(f.priceDollars).toFixed(2)}
          {f.compareAtDollars ? <s className="ml-2 text-ink-faint">${Number(f.compareAtDollars).toFixed(2)}</s> : null}
        </span>
      </div>

      {open && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name (EN)" value={f.nameEn} onChange={(v) => set({ nameEn: v })} />
            <Field label="Name (FR)" value={f.nameFr} onChange={(v) => set({ nameFr: v })} />
            <Field label="Tagline (EN)" value={f.tagline} onChange={(v) => set({ tagline: v })} />
            <Field label="Tagline (FR)" value={f.taglineFr} onChange={(v) => set({ taglineFr: v })} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 text-[0.85rem]">
              <span className="text-ink-faint">Price $</span>
              <input type="number" min={0} step={0.01} value={f.priceDollars} onChange={(e) => set({ priceDollars: Number(e.target.value) })} className="field w-[100px] text-right" />
            </label>
            <label className="flex items-center gap-1.5 text-[0.85rem]">
              <span className="text-ink-faint">Compare-at $</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={f.compareAtDollars ?? ""}
                onChange={(e) => set({ compareAtDollars: e.target.value === "" ? null : Number(e.target.value) })}
                className="field w-[100px] text-right"
              />
            </label>
            <label className="flex items-center gap-1.5 text-[0.85rem]">
              <input type="checkbox" checked={f.active} onChange={(e) => set({ active: e.target.checked })} />
              Active (visible in store)
            </label>
          </div>
          <Field label="Tags (comma-separated: glow, sculpt, cool, new, hygiene)" value={f.tagsCsv} onChange={(v) => set({ tagsCsv: v })} />
          <Area label="Description (EN) — HTML: <p>, <h3>How to use</h3>, <ol>, <h3>Good to know</h3>, <ul>" value={f.descriptionEn} onChange={(v) => set({ descriptionEn: v })} rows={8} mono />
          <Area label="Description (FR) — HTML" value={f.descriptionFr} onChange={(v) => set({ descriptionFr: v })} rows={8} mono />
          <Area label="Images (URLs, one per line — first is the main image)" value={f.imagesCsv} onChange={(v) => set({ imagesCsv: v })} rows={3} mono />
          <Area label='Options (JSON — [] if none). Example: [{"nameEn":"Colour","nameFr":"Couleur","values":[{"value":"pink","labelEn":"Pink","labelFr":"Rose"}]}]' value={f.optionsJson} onChange={(v) => set({ optionsJson: v })} rows={4} mono />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Supplier URL (CJ listing)" value={f.supplierUrl} onChange={(v) => set({ supplierUrl: v })} />
            <Field label="Supplier SKU / variant id" value={f.supplierSku} onChange={(v) => set({ supplierSku: v })} />
          </div>
          <Field label="Internal shipping note (admin only)" value={f.shippingNote} onChange={(v) => set({ shippingNote: v })} />
          <div className="flex items-center gap-3">
            <button type="button" onClick={save} disabled={pending} className="btn btn--sm">
              {pending ? "…" : slug ? "Save" : "Create"}
            </button>
            {slug && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${f.nameEn}"? This cannot be undone.`)) start(() => deleteProduct(slug));
                }}
                className="text-[0.8rem] text-terra underline underline-offset-2"
              >
                Delete
              </button>
            )}
            {msg && <span className="text-[0.8rem] text-ink-soft">{msg}</span>}
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-[0.78rem]">
      <span className="font-semibold text-ink-soft">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="field text-[0.9rem]" />
    </label>
  );
}

function Area({ label, value, onChange, rows = 3, mono }: { label: string; value: string; onChange: (v: string) => void; rows?: number; mono?: boolean }) {
  return (
    <label className="flex flex-col gap-1 text-[0.78rem]">
      <span className="font-semibold text-ink-soft">{label}</span>
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className={`field text-[0.85rem] ${mono ? "font-mono" : ""}`} />
    </label>
  );
}
