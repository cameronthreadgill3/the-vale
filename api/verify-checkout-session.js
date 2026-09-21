/**
 * GET /api/verify-checkout-session?session_id=
 * Confirm a Checkout session before granting Premium Backpack.
 *
 * Env: STRIPE_SECRET_KEY, PREMIUM_CHECKOUT_DEMO
 */
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let sessionId =
    (req.query && req.query.session_id) ||
    (req.body && req.body.sessionId) ||
    "";
  if (!sessionId && req.method === "POST" && typeof req.body === "string") {
    try {
      const parsed = JSON.parse(req.body);
      sessionId = parsed.sessionId || parsed.session_id || "";
    } catch {
      sessionId = "";
    }
  }
  if (!sessionId) {
    return res.status(400).json({ error: "Missing session_id" });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const demo =
    process.env.PREMIUM_CHECKOUT_DEMO === "1" ||
    process.env.NODE_ENV !== "production";

  if (String(sessionId).startsWith("demo_")) {
    if (!secret && demo) {
      return res.status(200).json({
        granted: true,
        demo: true,
        product: "premium-backpack",
      });
    }
    return res.status(400).json({ granted: false, error: "Invalid demo session" });
  }

  if (!secret) {
    return res.status(503).json({
      granted: false,
      error: "Stripe not configured",
    });
  }

  try {
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
      },
    );
    const data = await stripeRes.json();
    if (!stripeRes.ok) {
      return res
        .status(stripeRes.status)
        .json({ granted: false, error: data.error?.message || "Stripe error" });
    }
    const paid =
      data.payment_status === "paid" || data.status === "complete";
    const product = data.metadata?.product;
    if (!paid || product !== "premium-backpack") {
      return res.status(200).json({
        granted: false,
        product,
        payment_status: data.payment_status,
      });
    }
    return res.status(200).json({
      granted: true,
      product: "premium-backpack",
      sessionId: data.id,
    });
  } catch (e) {
    return res.status(500).json({
      granted: false,
      error: e.message || "Verify failed",
    });
  }
}
