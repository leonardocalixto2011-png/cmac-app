import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale, translate, type Locale } from "./messages";

/** Locale from the `cmac-locale` cookie (server components / metadata). */
export async function serverLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

/** Server-side `t()` bound to the cookie locale. */
export async function serverT() {
  const locale = await serverLocale();
  return {
    locale,
    t: (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
  };
}
