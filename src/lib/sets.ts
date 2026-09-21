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
    { slug: "microcurrent-facial-lift-device", qty: 1, variant: "White = CJPF104709102BY" },
    { slug: "facial-ice-roller", qty: 1, variant: "Pink = CJMJ198034901AZ" },
    { slug: "spa-headband", qty: 1, variant: "Beige = CJHL133914107GT" },
  ],
  "set-7am-reset": [
    { slug: "facial-ice-roller", qty: 1, variant: "Pink = CJMJ198034901AZ" },
    { slug: "under-eye-glow-wand", qty: 1, variant: "Rose gold (English) = CJYD202121801AZ" },
    { slug: "spa-headband", qty: 1, variant: "Beige = CJHL133914107GT" },
  ],
  "set-midnight-glow": [
    { slug: "sonic-silicone-cleansing-brush", qty: 1, variant: "Pink-USB = CJPF103247301AZ (never Pink Set)" },
    { slug: "led-red-light-mask", qty: 1, variant: 'Set = CJPF205440201AZ (ask CJ to remove the "original liquid")' },
    { slug: "satin-sleep-mask", qty: 1, variant: "Navy Blue = CJYD198717806FU" },
  ],
  "set-sweater-weather": [
    { slug: "led-red-light-mask", qty: 1, variant: 'Set = CJPF205440201AZ (ask CJ to remove the "original liquid")' },
    { slug: "electric-scalp-massager", qty: 1, variant: "White = CJST110710401AZ" },
    { slug: "satin-sleep-mask", qty: 1, variant: "Light Gray = CJYD198717802BY" },
    { slug: "spa-headband", qty: 1, variant: "Grey = CJHL133914103CX" },
  ],
  "set-pink-pop": [
    { slug: "under-eye-glow-wand", qty: 1, variant: "PINK PICK: Rose gold (English) = CJYD202121801AZ (no true pink; rose gold is the pink option)" },
    { slug: "sonic-silicone-cleansing-brush", qty: 1, variant: "PINK: Pink-USB = CJPF103247301AZ" },
    { slug: "facial-ice-roller", qty: 1, variant: "PINK: Pink = CJMJ198034901AZ" },
    { slug: "spa-headband", qty: 1, variant: "PINK: Pink = CJHL133914102BY" },
  ],
  "set-carry-on-glow": [
    { slug: "under-eye-glow-wand", qty: 1, variant: "Rose gold (English) = CJYD202121801AZ" },
    { slug: "satin-sleep-mask", qty: 1, variant: "Black = CJYD198717805EV" },
    { slug: "spa-headband", qty: 1, variant: "Beige = CJHL133914107GT" },
  ],
  "set-bestie-duo": [
    { slug: "facial-ice-roller", qty: 2, variant: "1× Pink = CJMJ198034901AZ + 1× Purple = CJMJ198034904DW" },
    { slug: "spa-headband", qty: 2, variant: "1× Pink = CJHL133914102BY + 1× Beige = CJHL133914107GT" },
  ],
};

/** Order of the four sets featured on the homepage. */
export const HOME_SETS = ["set-full-ritual", "set-7am-reset", "set-midnight-glow", "set-sweater-weather"] as const;

export function isSetSlug(slug: string): boolean {
  return slug in SET_CONTENTS;
}
