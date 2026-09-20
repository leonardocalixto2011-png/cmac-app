"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Icon } from "@/components/Icon";

export function LoginForm({ from, initialError }: { from?: string; initialError?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ? "Sign-in failed." : null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push(from && from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-ui text-[0.8rem] font-semibold text-ink-soft">Email</span>
        <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-ui text-[0.8rem] font-semibold text-ink-soft">Password</span>
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
      </label>
      {error && (
        <p className="text-sm text-terra" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn">
        <Icon name="check" />
        {pending ? "…" : "Sign in"}
      </button>
    </form>
  );
}
