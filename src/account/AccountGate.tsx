import { useState, type FormEvent } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { isClerkConfigured } from "@/account/clerkConfig";
import { demoSignIn, demoSignUp } from "@/account/demoAuth";
import type { ValeAccountUser } from "@/account/types";

type GateMode = "sign-in" | "sign-up";

const clerkAppearance = {
  variables: {
    colorPrimary: "#c9a227",
    colorBackground: "#12160e",
    colorText: "#e8e6d9",
    colorTextSecondary: "#b4bba6",
    colorInputBackground: "#070806",
    colorInputText: "#e8e6d9",
    colorNeutral: "#9aa288",
    borderRadius: "0.4rem",
    fontFamily: '"IBM Plex Sans", Figtree, system-ui, sans-serif',
    fontFamilyButtons: '"IBM Plex Mono", ui-monospace, monospace',
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full",
    card: "w-full",
  },
};

function ModeTabs({
  mode,
  onChange,
}: {
  mode: GateMode;
  onChange: (mode: GateMode) => void;
}) {
  return (
    <div className="vale-tab-bar w-full" role="tablist" aria-label="Account">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "sign-in"}
        className={`vale-tab vale-tap-sm flex-1 px-3 py-2 ${
          mode === "sign-in" ? "vale-tab-active" : ""
        }`}
        onClick={() => onChange("sign-in")}
      >
        Sign in
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "sign-up"}
        className={`vale-tab vale-tap-sm flex-1 px-3 py-2 ${
          mode === "sign-up" ? "vale-tab-active" : ""
        }`}
        onClick={() => onChange("sign-up")}
      >
        Sign up
      </button>
    </div>
  );
}

export function AccountGate({
  onDemoSignedIn,
  onContinueOffline,
}: {
  onDemoSignedIn: (user: ValeAccountUser) => void;
  onContinueOffline: () => void;
}) {
  const clerkOn = isClerkConfigured();
  const [mode, setMode] = useState<GateMode>("sign-in");
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
      className="vale-gate-stage flex h-full w-full items-center justify-center overflow-auto overscroll-contain p-4 sm:p-8"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="vale-text-screen w-full max-w-md px-5 py-5 sm:px-6 sm:py-6">
        <div className="text-center">
          <div className="vale-screen-kicker">Account</div>
          <h1 className="vale-gate-hero mt-1.5">The Vale</h1>
          <p className="vale-screen-aside">
            Create an account to unlock four character slots.
          </p>
        </div>

        {!clerkOn && (
          <div className="vale-ledger-line mt-4 px-3 py-2.5 text-xs leading-relaxed text-[#c3c8b4]">
            <span className="text-[#c9a227]">Setup:</span> Clerk keys are not
            configured. Running in <strong className="text-[#e8e6d9]">demo mode</strong>{" "}
            (local accounts only). Set{" "}
            <code className="text-[#e8e6d9]">VITE_CLERK_PUBLISHABLE_KEY</code> and{" "}
            <code className="text-[#e8e6d9]">CLERK_SECRET_KEY</code> for production auth.
            Character slots stay in browser storage until you move them to Postgres.
          </div>
        )}

        {clerkOn ? (
          <div className="vale-skill-section flex flex-col items-stretch gap-3">
            <ModeTabs mode={mode} onChange={setMode} />
            <div className="vale-gate-clerk w-full">
              {mode === "sign-in" ? (
                <SignIn
                  routing="hash"
                  signUpUrl="#sign-up"
                  appearance={clerkAppearance}
                />
              ) : (
                <SignUp
                  routing="hash"
                  signInUrl="#sign-in"
                  appearance={clerkAppearance}
                />
              )}
            </div>
            <p className="vale-screen-hint text-center">
              Use email + password. Set username / display name in the Clerk profile
              after sign-up.
            </p>
          </div>
        ) : (
          <form onSubmit={submitDemo} className="vale-skill-section space-y-3">
            <ModeTabs mode={mode} onChange={setMode} />
            {mode === "sign-up" && (
              <label className="vale-gate-label">
                Account display name
                <input
                  className="vale-gate-field"
                  value={displayName}
                  onChange={(ev) => setDisplayName(ev.target.value)}
                  autoComplete="nickname"
                  maxLength={32}
                  required
                />
              </label>
            )}
            <label className="vale-gate-label">
              Email
              <input
                type="email"
                className="vale-gate-field"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="vale-gate-label">
              Password
              <input
                type="password"
                className="vale-gate-field"
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
              className="vale-tap vale-ghost-btn vale-ghost-btn-accent w-full px-4 py-2.5 text-sm"
            >
              {mode === "sign-up" ? "Create account" : "Sign in"}
            </button>
          </form>
        )}

        <div className="vale-screen-actions vale-gate-actions">
          <button
            type="button"
            onClick={onContinueOffline}
            className="vale-tap vale-ghost-btn px-4 py-2 text-xs text-[#a8b09a]"
          >
            Continue offline (local) — character slots
          </button>
        </div>
      </div>
    </div>
  );
}
