# API routes

## Character slots (future)

The Vite SPA currently stores the four character slots in **Clerk `unsafeMetadata.valeCharacterSlots`** (or local demo storage when Clerk keys are absent). Neon/KV wiring can land later.

## Premium Backpack (Stripe)

Real-money IAP for **Premium Backpack** (+32 slots, +50% weight). Gold-shop **Woven Backpack** (+12) is separate.

| Route | Purpose |
|-------|---------|
| `POST /api/create-checkout-session` | Start Stripe Checkout (or demo grant if no `STRIPE_SECRET_KEY` + demo flag) |
| `GET /api/verify-checkout-session` | Verify `session_id` on success redirect **before** granting |
| `POST /api/stripe-webhook` | Stub for signed webhooks / future account sync |

### Env

See root `.env.example`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PREMIUM_BACKPACK_PRICE_ID`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_PREMIUM_BACKPACK_PRICE_ID`, `PREMIUM_CHECKOUT_DEMO` / `VITE_PREMIUM_CHECKOUT_DEMO`.

**Production rule:** do not grant Premium without a verified Checkout session (or webhook). Demo unlock only when the secret is missing and demo flags allow it.
