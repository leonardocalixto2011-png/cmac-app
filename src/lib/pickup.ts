/**
 * Local pickup: customers around L'Assomption can skip the courier and the
 * shipping fee, and collect the order in person.
 *
 * Today the pieces still come from the supplier, so pickup saves the fee but
 * not the wait; `localStock` flips to true once we hold stock of the
 * best-sellers here, and the copy then promises 48 hours instead. Keeping that
 * in one constant means the promise on the site can never drift from reality.
 */
export const PICKUP = {
  /** True only when the best-sellers are physically here. Drives every promise below. */
  localStock: false,
  cityEn: "L'Assomption",
  cityFr: "L'Assomption",
  /** Where people actually collect: arranged by email after the order. */
  areaEn: "L'Assomption, Repentigny, Charlemagne, Le Gardeur and the east end of Montréal",
  areaFr: "L'Assomption, Repentigny, Charlemagne, Le Gardeur et l'est de Montréal",
} as const;

/** Shipping charged on a pickup order: never anything. */
export const PICKUP_SHIPPING_CENTS = 0;
