/** Clerk publishable key from Vite env. Empty → demo / setup mode. */
export function getClerkPublishableKey(): string {
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  return typeof key === "string" ? key.trim() : "";
}

export function isClerkConfigured(): boolean {
  const key = getClerkPublishableKey();
  return key.startsWith("pk_");
}
