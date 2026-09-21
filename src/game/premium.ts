/** Premium Backpack unlock — demo grant locally, Stripe Checkout when env is set. */

export const PREMIUM_PRODUCT_ID = "premium-backpack";

export function isStripeClientConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY &&
      import.meta.env.VITE_PREMIUM_BACKPACK_PRICE_ID,
  );
}

/** Demo unlock is always available when Stripe keys are missing. */
export function isPremiumDemoAllowed(): boolean {
  if (!isStripeClientConfigured()) return true;
  return import.meta.env.VITE_PREMIUM_CHECKOUT_DEMO === "1";
}

export type CheckoutStart =
  | { ok: true; demo: true }
  | { ok: true; demo: false; url: string }
  | { ok: false; error: string };

export async function startPremiumCheckout(): Promise<CheckoutStart> {
  const priceId = import.meta.env.VITE_PREMIUM_BACKPACK_PRICE_ID;
  const origin = window.location.origin;
  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        successUrl: `${origin}/?premium=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/?premium=cancel`,
      }),
    });
    const data = (await res.json()) as {
      demo?: boolean;
      url?: string;
      error?: string;
    };
    if (!res.ok) {
      return { ok: false, error: data.error || "Checkout failed" };
    }
    if (data.demo) return { ok: true, demo: true };
    if (data.url) return { ok: true, demo: false, url: data.url };
    return { ok: false, error: "Checkout did not return a session" };
  } catch {
    return {
      ok: false,
      error: "Stripe API unavailable. Use Demo unlock locally.",
    };
  }
}

export async function verifyPremiumSession(sessionId: string): Promise<boolean> {
  if (!sessionId) return false;
  if (sessionId.startsWith("demo_")) return isPremiumDemoAllowed();
  try {
    const res = await fetch(
      `/api/verify-checkout-session?session_id=${encodeURIComponent(sessionId)}`,
    );
    if (!res.ok) return false;
    const data = (await res.json()) as {
      granted?: boolean;
      product?: string;
    };
    return data.granted === true && data.product === PREMIUM_PRODUCT_ID;
  } catch {
    return false;
  }
}

export function consumePremiumQuery(): {
  status: "success" | "cancel" | null;
  sessionId: string | null;
} {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("premium");
  const sessionId = params.get("session_id");
  if (status !== "success" && status !== "cancel") {
    return { status: null, sessionId: null };
  }
  params.delete("premium");
  params.delete("session_id");
  const next = params.toString();
  const url = next
    ? `${window.location.pathname}?${next}`
    : window.location.pathname;
  window.history.replaceState({}, "", url);
  return {
    status,
    sessionId: sessionId || null,
  };
}
