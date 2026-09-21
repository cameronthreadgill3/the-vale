import { useState, type FormEvent } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { isClerkConfigured } from "@/account/clerkConfig";
import { demoSignIn, demoSignUp } from "@/account/demoAuth";
import type { ValeAccountUser } from "@/account/types";

export function AccountGate({
  onDemoSignedIn,
  onContinueOffline,
}: {
  onDemoSignedIn: (user: ValeAccountUser) => void;
  onContinueOffline: () => void;
}) {
  const clerkOn = isClerkConfigured();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitDemo = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const result =
      mode === "sign-up"
        ? demoSignUp(email, password, displayName)
        : demoSignIn(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDemoSignedIn(result.user);
  };

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-auto overscroll-contain bg-[#0c0d0b] p-4 sm:p-8"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="w-full max-w-md">
        <h1 className="font-display text-center text-2xl tracking-wide text-[#c9a227] sm:text-3xl">
          The Vale
        </h1>
        <p className="mt-2 text-center text-sm text-[#a8b09a]">
          Create an account to unlock four character slots.
        </p>

        {!clerkOn && (
          <div className="mt-4 rounded border border-[#c9a227]/35 bg-[#161812] px-3 py-2 text-xs leading-relaxed text-[#a8b09a]">
            <span className="text-[#c9a227]">Setup:</span> Clerk keys are not
            configured. Running in <strong className="text-[#e8e6d9]">demo mode</strong>{" "}
            (local accounts only). Set{" "}
            <code className="text-[#e8e6d9]">VITE_CLERK_PUBLISHABLE_KEY</code> and{" "}
            <code className="text-[#e8e6d9]">CLERK_SECRET_KEY</code> for production auth.
            Character slots stay in browser storage until you move them to Postgres.
          </div>
        )}

        {clerkOn ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                className={`rounded border px-3 py-1.5 text-xs ${
                  mode === "sign-in"
                    ? "border-[#c9a227] text-[#c9a227]"
                    : "border-[#2a2e24] text-[#a8b09a]"
                }`}
                onClick={() => setMode("sign-in")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`rounded border px-3 py-1.5 text-xs ${
                  mode === "sign-up"
                    ? "border-[#c9a227] text-[#c9a227]"
                    : "border-[#2a2e24] text-[#a8b09a]"
                }`}
                onClick={() => setMode("sign-up")}
              >
                Sign up
              </button>
            </div>
            <div className="w-full [&_.cl-rootBox]:mx-auto [&_.cl-card]:bg-[#161812] [&_.cl-card]:border-[#2a2e24]">
              {mode === "sign-in" ? (
                <SignIn
                  routing="hash"
                  signUpUrl="#sign-up"
                  appearance={{
                    variables: {
                      colorPrimary: "#c9a227",
                      colorBackground: "#161812",
                      colorText: "#e8e6d9",
                    },
                  }}
                />
              ) : (
                <SignUp
                  routing="hash"
                  signInUrl="#sign-in"
                  appearance={{
                    variables: {
                      colorPrimary: "#c9a227",
                      colorBackground: "#161812",
                      colorText: "#e8e6d9",
                    },
                  }}
                />
              )}
            </div>
            <p className="text-center text-[11px] text-[#6a7260]">
              Use email + password. Set username / display name in the Clerk profile
              after sign-up.
            </p>
          </div>
        ) : (
          <form
            onSubmit={submitDemo}
            className="mt-6 space-y-3 rounded border border-[#2a2e24] bg-[#161812] p-4"
          >
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 rounded border px-3 py-1.5 text-xs ${
                  mode === "sign-in"
                    ? "border-[#c9a227] text-[#c9a227]"
                    : "border-[#2a2e24] text-[#a8b09a]"
                }`}
                onClick={() => setMode("sign-in")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`flex-1 rounded border px-3 py-1.5 text-xs ${
                  mode === "sign-up"
                    ? "border-[#c9a227] text-[#c9a227]"
                    : "border-[#2a2e24] text-[#a8b09a]"
                }`}
                onClick={() => setMode("sign-up")}
              >
                Sign up
              </button>
            </div>
            {mode === "sign-up" && (
              <label className="block text-xs text-[#a8b09a]">
                Account display name
                <input
                  className="mt-1 w-full rounded border border-[#2a2e24] bg-[#0c0d0b] px-3 py-2 text-sm text-[#e8e6d9] outline-none focus:border-[#c9a227]/60"
                  value={displayName}
                  onChange={(ev) => setDisplayName(ev.target.value)}
                  autoComplete="nickname"
                  maxLength={32}
                  required
                />
              </label>
            )}
            <label className="block text-xs text-[#a8b09a]">
              Email
              <input
                type="email"
                className="mt-1 w-full rounded border border-[#2a2e24] bg-[#0c0d0b] px-3 py-2 text-sm text-[#e8e6d9] outline-none focus:border-[#c9a227]/60"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-xs text-[#a8b09a]">
              Password
              <input
                type="password"
                className="mt-1 w-full rounded border border-[#2a2e24] bg-[#0c0d0b] px-3 py-2 text-sm text-[#e8e6d9] outline-none focus:border-[#c9a227]/60"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </label>
            {error && (
              <p className="text-xs text-[#c97a7a]" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="vale-tap w-full rounded border border-[#c9a227]/60 bg-[#1c1f16] px-4 py-2.5 text-sm text-[#c9a227] hover:border-[#c9a227]"
            >
              {mode === "sign-up" ? "Create account" : "Sign in"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center">
          <button
            type="button"
            onClick={onContinueOffline}
            className="text-xs text-[#6a7260] underline-offset-2 hover:text-[#a8b09a] hover:underline"
          >
            Continue offline (local)
          </button>
        </p>
      </div>
    </div>
  );
}
