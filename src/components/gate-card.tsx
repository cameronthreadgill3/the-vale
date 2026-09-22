import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VAULTS, type Vault } from "@/canon/catalog";

export function GateCard({
  title,
  copy,
  vault = "kettle",
}: {
  title: string;
  copy: string;
  vault?: Vault;
}) {
  const tier = VAULTS[vault];
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8">
      <Lock className="size-5 text-fg-muted" />
      <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">{copy}</p>
      <p className="mt-4 text-sm text-fg">
        ${tier.dollars} a month opens {tier.opens}. Venmo or Patreon, then a key. The game and Book One stay free.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link to="/subscribe">Keep the kettle</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/read">Read Book One</Link>
        </Button>
      </div>
    </div>
  );
}
