/**
 * Curated bundle "Sets". Pure data (no "@/" imports) so `prisma/seed.ts` can
 * import it too. A set is a normal Product row tagged "sets" with no options;
 * this file only records what goes inside each one and which CJ variant the
 * owner orders for fulfilment. Copy lives in the seed / DB (bilingual).
 */

export const SET_TAG = "sets";

export type SetComponent = {
  slug: string;
  qty: number;
  /** CJ variant(s) to order, e.g. "Pink = CJMJ198034901AZ". Owner-facing only. */
  variant: string;
};

export const SET_CONTENTS: Record<string, SetComponent[]> = {
  "set-full-ritual": [
    { slug: "led-red-light-mask", qty: 1, variant: 'Set = CJPF205440201AZ (ask CJ to remove the "original liquid")' },
    { slug: "microcurrent-facial-lift-device", qty: 1, variant: "Pink = CJPF104709101AZ" },
    { slug: "facial-ice-roller", qty: 1, variant: "Pink = CJMJ198034901AZ" },
    { slug: "spa-headband", qty: 1, variant: "Beige = CJHL133914107GT" },
    { slug: "satin-beauty-sleep-set", qty: 1, variant: "Champagne = CJCS148046301AZ (Shipping From: China, not US)" },
  ],
  "set-7am-reset": [
    { slug: "facial-ice-roller", qty: 1, variant: "Pink = CJMJ198034901AZ" },
    { slug: "under-eye-glow-wand", qty: 1, variant: "Rose gold (English) = CJYD202121801AZ" },
    { slug: "spa-headband", qty: 1, variant: "Pink = CJHL133914102BY" },
    { slug: "satin-scrunchie", qty: 1, variant: "Champagne = CJTF106711602BY" },
    { slug: "reusable-cleansing-puff", qty: 1, variant: "CJPF101912105EV (pick a pink swatch)" },
  ],
  "set-midnight-glow": [
    { slug: "sonic-silicone-cleansing-brush", qty: 1, variant: "Pink-USB = CJPF103247301AZ (never Pink Set)" },
    { slug: "led-red-light-mask", qty: 1, variant: 'Set = CJPF205440201AZ (ask CJ to remove the "original liquid")' },
    { slug: "satin-beauty-sleep-set", qty: 1, variant: "Champagne = CJCS148046301AZ (Shipping From: China, not US)" },
  ],
  "set-sweater-weather": [
    { slug: "led-red-light-mask", qty: 1, variant: 'Set = CJPF205440201AZ (ask CJ to remove the "original liquid")' },
    { slug: "electric-scalp-massager", qty: 1, variant: "White = CJST110710401AZ" },
    { slug: "satin-sleep-mask", qty: 1, variant: "Light Gray = CJYD198717802BY" },
    { slug: "spa-headband", qty: 1, variant: "Beige = CJHL133914107GT" },
    { slug: "cozy-fleece-socks", qty: 1, variant: "Beige = CJWZ191410903CX" },
  ],
  "set-pink-pop": [
    { slug: "under-eye-glow-wand", qty: 1, variant: "PINK PICK: Rose gold (English) = CJYD202121801AZ (no true pink; rose gold is the pink option)" },
    { slug: "sonic-silicone-cleansing-brush", qty: 1, variant: "PINK: Pink-USB = CJPF103247301AZ" },
    { slug: "facial-ice-roller", qty: 1, variant: "PINK: Pink = CJMJ198034901AZ" },
    { slug: "spa-headband", qty: 1, variant: "PINK: Pink = CJHL133914102BY" },
    { slug: "satin-scrunchie", qty: 1, variant: "PINK: Pink = CJTF106711601AZ" },
    { slug: "pink-shell-makeup-pouch", qty: 1, variant: "PINK: Rose Pink = CJYD191668204DW (holds the set)" },
  ],
  "set-carry-on-glow": [
    { slug: "under-eye-glow-wand", qty: 1, variant: "Rose gold (English) = CJYD202121801AZ" },
    { slug: "satin-sleep-mask", qty: 1, variant: "Black = CJYD198717805EV" },
    { slug: "spa-headband", qty: 1, variant: "Beige = CJHL133914107GT" },
    { slug: "travel-makeup-organizer", qty: 1, variant: "Rose Pink = CJYD185535502BY (holds the set)" },
    { slug: "satin-scrunchie", qty: 1, variant: "Champagne = CJTF106711602BY" },
  ],
  "set-bestie-duo": [
    { slug: "facial-ice-roller", qty: 2, variant: "1× Pink = CJMJ198034901AZ + 1× Purple = CJMJ198034904DW" },
    { slug: "spa-headband", qty: 2, variant: "1× Pink = CJHL133914102BY + 1× Beige = CJHL133914107GT" },
    { slug: "satin-scrunchie", qty: 2, variant: "1× Pink = CJTF106711601AZ + 1× Purple = CJTF106711607GT (one per roller colour)" },
  ],
  "set-between-appointments": [
    { slug: "nail-care-pen", qty: 1, variant: "Pink (USB) = CJYD161928501AZ" },
    { slug: "rose-gold-manicure-kit", qty: 1, variant: "Rose Gold, Style C = CJJT100243006FU" },
    { slug: "gel-manicure-gloves", qty: 1, variant: "Rose Red = CJMJ118758902BY" },
  ],
  "set-pedi-night": [
    { slug: "electric-foot-file", qty: 1, variant: "Pink, outlet No (USB) = CJYD196463901AZ" },
    { slug: "cozy-fleece-socks", qty: 1, variant: "Beige = CJWZ191410903CX (matches the photo)" },
    { slug: "spa-headband", qty: 1, variant: "Pink = CJHL133914102BY" },
    { slug: "satin-scrunchie", qty: 1, variant: "Pink = CJTF106711601AZ" },
  ],
  "set-mani-pedi": [
    { slug: "nail-care-pen", qty: 1, variant: "Pink (USB) = CJYD161928501AZ" },
    { slug: "rose-gold-manicure-kit", qty: 1, variant: "Rose Gold, Style C = CJJT100243006FU" },
    { slug: "gel-manicure-gloves", qty: 1, variant: "White = CJMJ118758906FU" },
    { slug: "electric-foot-file", qty: 1, variant: "Pink, outlet No (USB) = CJYD196463901AZ" },
    { slug: "cozy-fleece-socks", qty: 1, variant: "Beige = CJWZ191410903CX (matches the photo)" },
  ],
};

/** Order of the four sets featured on the homepage. */
export const HOME_SETS = ["set-full-ritual", "set-7am-reset", "set-midnight-glow", "set-sweater-weather"] as const;

export function isSetSlug(slug: string): boolean {
  return slug in SET_CONTENTS;
}
