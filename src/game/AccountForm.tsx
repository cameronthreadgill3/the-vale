import { useState } from "react";
import { authClient, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export function AccountForm({ callbackURL = "/play" }: { callbackURL?: string }) {
  const [mode, setMode] = useState<"in" | "up">("up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.trim().split("@")[0] || "Walker",
        });
        if (error) throw new Error(error.message || "Could not sign up.");
      } else {
        const { error } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (error) throw new Error(error.message || "Could not sign in.");
      }
      try {
        await authClient.getSession();
      } catch {
        /* session store recovers */
      }
    } catch (caught) {
      setErr(caught instanceof Error ? caught.message : "That did not take.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <form className="flex flex-col gap-3" onSubmit={submit}>
        {mode === "up" ? (
          <label className="block text-xs font-medium text-fg-muted">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 24))}
              autoComplete="name"
              className="mt-1 h-11 w-full rounded-md border border-border bg-surface-2 px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        ) : null}
        <label className="block text-xs font-medium text-fg-muted">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="mt-1 h-11 w-full rounded-md border border-border bg-surface-2 px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block text-xs font-medium text-fg-muted">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            className="mt-1 h-11 w-full rounded-md border border-border bg-surface-2 px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        {err ? <p className="text-xs text-hp">{err}</p> : null}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "A moment…" : mode === "up" ? "Make an account" : "Sign in"}
        </Button>
      </form>
      <button
        type="button"
        className="text-sm text-fg-muted hover:text-fg"
        onClick={() => {
          setErr("");
          setMode(mode === "up" ? "in" : "up");
        }}
      >
        {mode === "up" ? "Already walk here? Sign in" : "New to the square? Make an account"}
      </button>
      <div className="flex items-center gap-3 text-xs tracking-[0.18em] text-fg-subtle uppercase">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-2">
        {GROK_PROVIDERS.map((p) => (
          <Button
            key={p.providerId}
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => signIn(p.providerId, { callbackURL })}
          >
            Continue with {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
