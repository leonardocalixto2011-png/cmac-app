import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

/** Guards /admin/* — anyone who is not ADMIN is sent to the login page. */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (req.auth?.user?.role !== "ADMIN") {
      const url = new URL("/admin/login", req.nextUrl.origin);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }
});

export const config = { matcher: ["/admin/:path*"] };
