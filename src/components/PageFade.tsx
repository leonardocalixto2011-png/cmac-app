"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Fades each page in on navigation. The key remounts the wrapper (and only the
 * wrapper's animation) when the route changes; the page tree itself is new anyway.
 */
export function PageFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="cmac-page">
      {children}
    </div>
  );
}
