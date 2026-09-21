import type { SVGProps } from "react";

export type IconName =
  | "menu"
  | "close"
  | "arrow"
  | "check"
  | "plus"
  | "cart"
  | "mail"
  | "light"
  | "bolt"
  | "snow"
  | "clock"
  | "heart"
  | "spark"
  | "user"
  | "gift";

const STROKE = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;

const PATHS: Record<IconName, React.ReactNode> = {
  user: (
    <g {...STROKE} strokeWidth="1.7">
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.8 20c.9-3.6 3.8-5.6 7.2-5.6s6.3 2 7.2 5.6" />
    </g>
  ),
  gift: (
    <g {...STROKE} strokeWidth="1.7">
      <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
      <path d="M5 12.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7.5M12 8.5V21M12 8.5c-1.8 0-4.5-.6-4.5-2.6 0-1.3 1-2 2-2 1.9 0 2.5 2.6 2.5 4.6Zm0 0c1.8 0 4.5-.6 4.5-2.6 0-1.3-1-2-2-2-1.9 0-2.5 2.6-2.5 4.6Z" />
    </g>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" {...STROKE} strokeWidth="1.7" />,
  close: <path d="M6 6l12 12M18 6L6 18" {...STROKE} strokeWidth="1.7" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" {...STROKE} strokeWidth="2" />,
  check: <path d="M5 12l5 5L20 7" {...STROKE} strokeWidth="2.2" />,
  plus: <path d="M12 5v14M5 12h14" {...STROKE} strokeWidth="2" />,
  cart: (
    <g {...STROKE} strokeWidth="1.7">
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.8L21 8H6.3" />
      <circle cx="9.5" cy="20" r="1.2" />
      <circle cx="17.5" cy="20" r="1.2" />
    </g>
  ),
  mail: (
    <g {...STROKE} strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4 7l8 6 8-6" />
    </g>
  ),
  light: (
    <g {...STROKE} strokeWidth="1.6">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
    </g>
  ),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" {...STROKE} strokeWidth="1.6" />,
  snow: <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" {...STROKE} strokeWidth="1.6" />,
  clock: (
    <g {...STROKE} strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </g>
  ),
  heart: <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" {...STROKE} strokeWidth="1.6" />,
  spark: (
    <path
      d="M12 2c.5 4.6 2.4 6.5 7 7-4.6.5-6.5 2.4-7 7-.5-4.6-2.4-6.5-7-7 4.6-.5 6.5-2.4 7-7z"
      fill="currentColor"
    />
  ),
};

export function Icon({
  name,
  title,
  ...rest
}: { name: IconName; title?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}
