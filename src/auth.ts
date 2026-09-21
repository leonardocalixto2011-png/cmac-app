import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { LIMITS, ipFrom, rateLimit } from "@/lib/rate-limit";

/**
 * Credentials login for both the store owner (ADMIN, seeded) and Glow Club
 * members (CUSTOMER, self sign-up). The admin form sends `scope: "admin"` so a
 * customer can never obtain a session from /admin/login; /admin/* itself is
 * still guarded by role in src/proxy.ts and the admin layout.
 * Failures are always a generic null (no account enumeration) and throttled
 * per email and per IP.
 */
const DUMMY_HASH = "$2b$10$VYB9d0uZPYxz23/UBo5ql.aLY5p2Kkt2E0wI/UvmUPWBsM0f/BOwm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, scope: {} },
      authorize: async (creds, request) => {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const password = String(creds?.password ?? "");
        const adminOnly = creds?.scope === "admin";
        if (!email || !password || password.length > 200) return null;

        const ip = request instanceof Request ? ipFrom(request.headers) : "unknown";
        const [okEmail, okIp] = await Promise.all([
          rateLimit(`login:e:${email}`, LIMITS.loginEmail),
          rateLimit(`login:ip:${ip}`, LIMITS.loginIp),
        ]);
        if (!okEmail || !okIp) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
          await bcrypt.compare(password, DUMMY_HASH); // similar timing whether or not the account exists
          return null;
        }
        if (adminOnly && user.role !== "ADMIN") return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
