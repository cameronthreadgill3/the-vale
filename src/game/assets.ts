/** Root-relative in the live app; `./` when packed for itch.io. */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path.replace(/^\//, "")}`;
}
