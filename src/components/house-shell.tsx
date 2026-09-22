import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { PRICE } from "@/canon/catalog";
import { cn } from "@/lib/utils";

const LINKS: { to: "/" | "/play" | "/lore" | "/read" | "/audio" | "/anime" | "/comics"; label: string; exact?: boolean }[] = [
  { to: "/", label: "House", exact: true },
  { to: "/play", label: "Play" },
  { to: "/lore", label: "Lore" },
  { to: "/read", label: "Read" },
  { to: "/audio", label: "Voices" },
  { to: "/anime", label: "Anime" },
  { to: "/comics", label: "Comics" },
];

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-11 w-24 shrink-0 animate-pulse rounded-md bg-surface-2" />;
  }
  if (user) {
    return (
      <div className="min-w-0 [&_span]:max-w-[12ch] [&_span]:truncate [&_span]:text-fg [&_img]:size-8 [&_button]:text-fg-muted">
        <UserButton />
      </div>
    );
  }
  return (
    <Link
      to="/login"
      className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
    >
      Sign in
    </Link>
  );
}

export function HouseShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/92 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="shrink-0">
            <p className="font-display text-sm font-semibold tracking-wide text-fg">The House</p>
            <p className="text-[10px] tracking-[0.18em] text-fg-subtle uppercase">A Story as Old as Time</p>
          </Link>
          <nav className="-mx-1 flex min-w-0 flex-1 items-center gap-0 overflow-x-auto px-1">
            {LINKS.map((l) => {
              const active = l.exact ? pathname === l.to : pathname === l.to || pathname.startsWith(`${l.to}/`);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center px-3 text-sm font-medium transition-colors",
                    active ? "text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/subscribe"
              className="hidden h-11 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground sm:inline-flex"
            >
              ${PRICE.dollars}/{PRICE.period === "month" ? "mo" : PRICE.period}
            </Link>
            <AuthSlot />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>The game is free. Book One is free. The later story keeps the kettle going.</p>
          <Link to="/subscribe" className="text-fg hover:underline">
            Membership ${PRICE.dollars}/mo
          </Link>
        </div>
      </footer>
    </div>
  );
}
