/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_PREMIUM_BACKPACK_PRICE_ID?: string;
  readonly VITE_PREMIUM_CHECKOUT_DEMO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
