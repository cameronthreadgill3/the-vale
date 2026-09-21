/**
 * POST /api/create-checkout-session
 * Creates a Stripe Checkout Session for Premium Backpack.
 *
 * Env:
 *   STRIPE_SECRET_KEY
 *   STRIPE_PREMIUM_BACKPACK_PRICE_ID
 *   PREMIUM_CHECKOUT_DEMO=1  — when secret missing, return demo grant (dev only)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId =
    body.priceId || process.env.STRIPE_PREMIUM_BACKPACK_PRICE_ID;
  const demo =
    process.env.PREMIUM_CHECKOUT_DEMO === "1" ||
    process.env.NODE_ENV !== "production";

  if (!secret) {
    if (demo) {
      return res.status(200).json({
        demo: true,
        sessionId: `demo_${Date.now()}`,
        product: "premium-backpack",
      });
    }
    return res.status(503).json({
      error:
        "Stripe not configured (set STRIPE_SECRET_KEY). Demo unlock requires PREMIUM_CHECKOUT_DEMO=1.",
    });
  }

  if (!priceId) {
    return res.status(400).json({ error: "Missing Stripe Price id" });
  }

  const successUrl =
    body.successUrl ||
    "https://vale-as-old-as-time.vercel.app/?premium=success&session_id={CHECKOUT_SESSION_ID}";
  const cancelUrl =
    body.cancelUrl || "https://vale-as-old-as-time.vercel.app/?premium=cancel";

  try {
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", successUrl);
    params.set("cancel_url", cancelUrl);
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("metadata[product]", "premium-backpack");
    if (body.characterId) {
      params.set("metadata[characterId]", String(body.characterId));
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const data = await stripeRes.json();
    if (!stripeRes.ok) {
      return res
        .status(stripeRes.status)
        .json({ error: data.error?.message || "Stripe error" });
    }
    return res.status(200).json({ url: data.url, sessionId: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Checkout failed" });
  }
}
