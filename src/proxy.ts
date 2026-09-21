import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
// Keep in sync with LOCALE_COOKIE in src/i18n/messages.ts (not imported, to keep the edge bundle small)
const LOCALE_COOKIE = "cmac-locale";

const { auth } = NextAuth(authConfig);

/**
 * 1. Guards /admin/* — anyone who is not ADMIN is sent to the login page.
 * 2. `?lang=fr` / `?lang=en` on any page switches the language for that request
 *    (so the French Google feed lands on French pages, even for crawlers without
 *    cookies) and remembers it in the `cmac-locale` cookie.
 */
export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (req.auth?.user?.role !== "ADMIN") {
      const url = new URL("/admin/login", req.nextUrl.origin);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  const lang = searchParams.get("lang");
  if (lang === "fr" || lang === "en") {
    const headers = new Headers(req.headers);
    const others = (req.headers.get("cookie") ?? "")
      .split(";")
      .map((c) => c.trim())
      .filter((c) => c && !c.startsWith(`${LOCALE_COOKIE}=`));
    headers.set("cookie", [...others, `${LOCALE_COOKIE}=${lang}`].join("; "));
    const res = NextResponse.next({ request: { headers } });
    res.cookies.set(LOCALE_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|feeds|favicon.ico|icon.svg|robots.txt|sitemap.xml|opengraph-image).*)",
  ],
};
