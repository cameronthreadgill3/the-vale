/**
 * POST /api/stripe-webhook
 * Optional webhook for server-side entitlement grants.
 * Production: verify STRIPE_WEBHOOK_SECRET; do not trust client alone for multi-device sync.
 *
 * This MVP still grants via verify-checkout-session on success redirect.
 * Webhook stub records events for future account-linked entitlements.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(503).json({
      error: "Set STRIPE_WEBHOOK_SECRET to enable webhook verification",
    });
  }
  return res.status(200).json({
    received: true,
    note: "Configure Stripe CLI / dashboard to this URL; grant via verify-checkout-session for now.",
  });
}
