import { createFileRoute, Link } from "@tanstack/react-router";
import { AccountForm } from "@/game/AccountForm";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.22em] text-fg-muted uppercase">The House</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          Email and a password keep your four walkers. Membership is separate.
        </p>
        <div className="mt-8">
          <SignedIn>
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-fg">You are signed in.</p>
                <UserButton />
              </div>
              <Button asChild>
                <Link to="/play">The company</Link>
              </Button>
            </div>
          </SignedIn>
          <SignedOut>
            <AccountForm callbackURL="/play" />
          </SignedOut>
        </div>
        <Link to="/" className="mt-8 inline-flex h-11 items-center text-sm text-fg-muted hover:text-fg">
          Back to the house
        </Link>
      </div>
    </main>
  );
}
