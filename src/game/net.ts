import { CLASS_ORDER, type ClassId } from "./classes";
import { heartbeat, leavePresence, sayInRealm, type RealmWalker } from "./realm";

export type ChatLine = { from: string; text: string; at: number; id?: number };

export type RemoteWalker = {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  x: number;
  y: number;
  facing: number;
  hp: number;
  maxHp: number;
  tx: number;
  ty: number;
  walkT: number;
  seen: number;
};

type Pose = {
  n: string;
  c: ClassId;
  lv: number;
  x: number;
  y: number;
  f: number;
  hp: number;
  mh: number;
};

const CLASSES = new Set<string>(CLASS_ORDER);

export function makePeerId(): string {
  const a = new Uint8Array(8);
  crypto.getRandomValues(a);
  return `w${[...a].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export class ValeNet {
  remotes = new Map<string, RemoteWalker>();
  chat: ChatLine[] = [];
  roomKey = "";
  joined = false;
  day = 0;
  onlineCount = 0;
  private selfId = makePeerId();
  private locationId = "";
  private poseBuf: Pose | null = null;
  private beatT = 0;
  private inflight = false;
  private onChat: ((line: ChatLine) => void) | null = null;
  private seenChat = new Set<number>();
  private onLoot: ((msg: { k: "l" | "x"; id: string; x?: number; y?: number; item?: string; qty?: number; gold?: number; expires?: number }) => void) | null = null;
  private lootIds = new Set<string>();

  listen(fn: (line: ChatLine) => void) {
    this.onChat = fn;
  }

  listenLoot(fn: typeof this.onLoot) {
    this.onLoot = fn;
  }

  dropLoot() {
    /* loot is posted to the realm; heartbeat carries it */
  }

  takeLoot() {
    /* takeGroundLoot is the authority */
  }

  enter(locationId: string, _name: string) {
    if (this.locationId === locationId && this.joined) return;
    if (this.locationId && this.locationId !== locationId) this.leave();
    this.locationId = locationId;
    this.roomKey = locationId;
    this.selfId = makePeerId();
    this.joined = true;
    this.lootIds.clear();
    this.beatT = 1;
  }

  leave() {
    if (this.joined) void leavePresence({ data: { sessionId: this.selfId } }).catch(() => {});
    this.joined = false;
    this.locationId = "";
    this.roomKey = "";
    this.remotes.clear();
    this.onlineCount = 0;
  }

  pose(p: Pose) {
    this.poseBuf = p;
  }

  say(name: string, text: string) {
    const t = text.trim().slice(0, 80);
    if (!t || !this.locationId) return;
    const line: ChatLine = { from: name, text: t, at: Date.now() };
    this.pushChat(line);
    void sayInRealm({ data: { locationId: this.locationId, text: t, name } })
      .then((r) => {
        if (r.ok && r.line.id) this.seenChat.add(r.line.id);
      })
      .catch(() => {});
  }

  tick(dt: number) {
    const now = performance.now();
    const k = Math.min(1, dt * 14);
    for (const [id, r] of this.remotes) {
      r.x += (r.tx - r.x) * k;
      r.y += (r.ty - r.y) * k;
      if (Math.hypot(r.tx - r.x, r.ty - r.y) > 2) r.walkT += dt * 6;
      if (now - r.seen > 8000) this.remotes.delete(id);
    }
    this.beatT += dt;
    if (this.joined && !this.inflight && this.beatT > 0.4 && this.poseBuf) {
      this.beatT = 0;
      this.pulse();
    }
  }

  online(): number {
    return this.onlineCount;
  }

  private pulse() {
    const p = this.poseBuf;
    if (!p || !this.locationId) return;
    this.inflight = true;
    void heartbeat({
      data: {
        sessionId: this.selfId,
        locationId: this.locationId,
        name: p.n,
        classId: p.c,
        level: p.lv,
        x: p.x,
        y: p.y,
        facing: p.f,
        hp: p.hp,
        maxHp: p.mh,
      },
    })
      .then((snap) => {
        this.day = snap.now / 1000 / 210;
        this.onlineCount = snap.online;
        const live = new Set(snap.walkers.map((w) => w.id));
        for (const id of this.remotes.keys()) {
          if (!live.has(id)) this.remotes.delete(id);
        }
        for (const w of snap.walkers) this.hearWalker(w);
        for (const line of snap.chat) {
          if (this.seenChat.has(line.id)) continue;
          this.seenChat.add(line.id);
          this.pushChat({ from: line.from, text: line.text, at: line.at, id: line.id });
        }
        const lootLive = new Set(snap.loot.map((d) => d.id));
        for (const id of this.lootIds) {
          if (!lootLive.has(id)) {
            this.onLoot?.({ k: "x", id });
            this.lootIds.delete(id);
          }
        }
        for (const d of snap.loot) {
          if (this.lootIds.has(d.id)) continue;
          this.lootIds.add(d.id);
          this.onLoot?.({
            k: "l",
            id: d.id,
            x: d.x,
            y: d.y,
            item: d.item ?? undefined,
            qty: d.qty,
            gold: d.gold,
            expires: d.expires,
          });
        }
      })
      .catch(() => {
        this.onlineCount = 0;
      })
      .finally(() => {
        this.inflight = false;
      });
  }

  private hearWalker(w: RealmWalker) {
    const c = (CLASSES.has(w.classId) ? w.classId : "warrior") as ClassId;
    const prev = this.remotes.get(w.id);
    const moved = prev ? Math.hypot(w.x - prev.tx, w.y - prev.ty) : 0;
    this.remotes.set(w.id, {
      id: w.id,
      name: String(w.name || "Walker").slice(0, 18),
      classId: c,
      level: Math.max(1, Math.floor(w.level || 1)),
      x: prev?.x ?? w.x,
      y: prev?.y ?? w.y,
      tx: w.x,
      ty: w.y,
      facing: w.facing,
      hp: w.hp,
      maxHp: w.maxHp,
      walkT: (prev?.walkT ?? 0) + (moved > 4 ? 0.4 : 0),
      seen: performance.now(),
    });
  }

  private pushChat(line: ChatLine) {
    this.chat = [...this.chat.slice(-23), line];
    this.onChat?.(line);
  }
}
