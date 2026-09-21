import type { ValeAccountUser } from "@/account/types";

const DEMO_USER_KEY = "vale-demo-user-v1";
const DEMO_SESSION_KEY = "vale-demo-session-v1";

type DemoRecord = {
  id: string;
  email: string;
  displayName: string;
  /** Demo only — not for production. */
  password: string;
};

function readUsers(): DemoRecord[] {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as DemoRecord[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: DemoRecord[]): void {
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(users));
}

export function getDemoSession(): ValeAccountUser | null {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as ValeAccountUser;
    if (!o?.id || !o.email) return null;
    return { ...o, demo: true };
  } catch {
    return null;
  }
}

export function clearDemoSession(): void {
  localStorage.removeItem(DEMO_SESSION_KEY);
}

export function demoSignUp(
  email: string,
  password: string,
  displayName: string,
): { ok: true; user: ValeAccountUser } | { ok: false; error: string } {
  const e = email.trim().toLowerCase();
  const name = displayName.trim().slice(0, 32);
  if (!e || !e.includes("@")) return { ok: false, error: "Enter a valid email." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  if (!name) return { ok: false, error: "Enter an account display name." };
  const users = readUsers();
  if (users.some((u) => u.email === e)) {
    return { ok: false, error: "An account with that email already exists (demo)." };
  }
  const rec: DemoRecord = {
    id: `demo_${Date.now().toString(36)}`,
    email: e,
    displayName: name,
    password,
  };
  users.push(rec);
  writeUsers(users);
  const user: ValeAccountUser = {
    id: rec.id,
    email: rec.email,
    displayName: rec.displayName,
    demo: true,
  };
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
  return { ok: true, user };
}

export function demoSignIn(
  email: string,
  password: string,
): { ok: true; user: ValeAccountUser } | { ok: false; error: string } {
  const e = email.trim().toLowerCase();
  const users = readUsers();
  const rec = users.find((u) => u.email === e);
  if (!rec || rec.password !== password) {
    return { ok: false, error: "Invalid email or password (demo)." };
  }
  const user: ValeAccountUser = {
    id: rec.id,
    email: rec.email,
    displayName: rec.displayName,
    demo: true,
  };
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
  return { ok: true, user };
}
