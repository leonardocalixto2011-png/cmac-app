// Small one-off effects that need the DOM: a dot that flies from an "add" button
// to the cart, and the event the cart toast listens to. Every one of them is a
// no-op when the visitor asked for reduced motion.

export const ADDED_EVENT = "cmac:added";

export function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Tells the toast (and anything else listening) that a line was added to the cart. */
export function announceAdded(name: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADDED_EVENT, { detail: { name } }));
}

/**
 * Flies a terracotta dot from `from` to the nav's cart button, then bumps the
 * button. Falls back to just the bump when the cart button is off-screen (mobile
 * drawer closed) or motion is reduced.
 */
export function flyToCart(from: HTMLElement | null) {
  if (typeof window === "undefined") return;
  const target = document.querySelector<HTMLElement>("[data-cart-target]");
  if (!target) return;
  const bump = () => {
    target.classList.remove("is-bump");
    void target.offsetWidth; // restart the animation when two adds come in a row
    target.classList.add("is-bump");
  };
  const a = from?.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  if (!from || !a || reducedMotion() || b.width === 0 || typeof from.animate !== "function") {
    bump();
    return;
  }
  const dot = document.createElement("span");
  dot.className = "cmac-fly";
  dot.setAttribute("aria-hidden", "true");
  const x0 = a.left + a.width / 2 - 7;
  const y0 = a.top + a.height / 2 - 7;
  const dx = b.left + b.width / 2 - 7 - x0;
  const dy = b.top + b.height / 2 - 7 - y0;
  dot.style.left = `${x0}px`;
  dot.style.top = `${y0}px`;
  document.body.appendChild(dot);
  const anim = dot.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 110}px) scale(1.25)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.25)`, opacity: 0.4 },
    ],
    { duration: 720, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)", fill: "forwards" },
  );
  anim.onfinish = () => {
    dot.remove();
    bump();
  };
}
