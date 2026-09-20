import { BRAND } from "./brand";
import type { Locale } from "@/i18n/messages";

export function fmtDateTime(d: Date, locale: Locale = "fr"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BRAND.timeZone,
  }).format(d);
}

export function fmtDate(d: Date, locale: Locale = "fr"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: BRAND.timeZone,
  }).format(d);
}
