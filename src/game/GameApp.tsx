import { useEffect, useRef, useState, type RefObject } from "react";
import {
  Backpack,
  Heart,
  Map,
  Pause,
  Play,
  ScrollText,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SignInGate } from "@/lib/auth/gates";
import {
  CONTINENT_ORDER,
  CONTINENTS,
  listContinent,
  otherEnd,
  passagesFrom,
  settlement,
  type ContinentId,
} from "./atlas";
import { CLASSES, CLASS_ORDER, type ClassId } from "./classes";
import { AccountForm } from "./AccountForm";
import { BankRoom, HouseRoom, InnRoom, MillRoom, ShopRoom } from "./Interiors";
import { ITEMS, RARITY_CLASS, RARITY_LABEL, SLOT_ORDER, type EquipSlot } from "./items";
import { canWear, LADDER } from "./gear";
import { formatCoins } from "./money";
import { jobNeed, roleLabel, type Npc } from "./life";
import { shopIdFromRole } from "./shops";
import { createGame, type GameHandle } from "./engine";
import { asset } from "./assets";
import { useGameStore } from "./store";
import { listWalkers } from "./walkers";

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameHandle | null>(null);
  const screen = useGameStore((s) => s.screen);
  const overlay = useGameStore((s) => s.overlay);
  const setScreen = useGameStore((s) => s.setScreen);
  const hydrateRoster = useGameStore((s) => s.hydrateRoster);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = createGame(canvas);
    gameRef.current = g;
    const qa = new URLSearchParams(window.location.search).has("qa");
    if (qa) {
      useGameStore.getState().setScreen("playing");
      g.startRun("warrior", "Warden");
    }
    return () => {
      g.destroy();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    void listWalkers()
      .then((slots) => hydrateRoster(slots))
      .catch(() => useGameStore.getState().pulse({ accountReady: true }));
  }, [hydrateRoster]);

  const playing = screen === "playing" || screen === "paused";

  return (
    <div className="relative size-full overflow-hidden bg-bg">
      <canvas ref={canvasRef} className="absolute inset-0 size-full touch-none" />
      {screen === "title" && <Title />}
      {screen === "login" && <Slots game={gameRef} />}
      {screen === "class" && <ClassSelect game={gameRef} />}
      {playing && <Hud game={gameRef} onPause={() => gameRef.current?.togglePause()} />}
      {screen === "paused" && <PauseMenu game={gameRef} />}
      {screen === "gameover" && <GameOver game={gameRef} />}
      {screen === "scores" && <Scores back="title" />}
      {screen === "patches" && <PatchNotes back="title" />}
      {screen === "how" && <HowTo />}
      {playing && overlay === "playing" && <ChatDock game={gameRef} />}
      {playing && overlay === "playing" && <CombatPad game={gameRef} />}
      {overlay === "who" && <Who />}
      {overlay === "talk" && <Talk game={gameRef} />}
      {overlay === "bank" && <BankRoom game={gameRef} />}
      {overlay === "shop" && <ShopRoom game={gameRef} />}
      {overlay === "inn" && <InnRoom game={gameRef} />}
      {overlay === "mill" && <MillRoom />}
      {overlay === "house" && <HouseRoom />}
      {overlay === "pack" && <Pack game={gameRef} />}
      {overlay === "gear" && <GearCodex />}
      {overlay === "atlas" && <Atlas game={gameRef} />}
    </div>
  );
}

function Title() {
  const setScreen = useGameStore((s) => s.setScreen);
  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/70 to-transparent px-5 pb-10 safe-screen">
      <p className="text-xs tracking-[0.22em] text-fg-muted uppercase">A frontier of the Vale</p>
      <h1 className="mt-1 font-display text-4xl font-semibold leading-tight">A Story as Old as Time</h1>
      <p className="mt-3 max-w-md text-sm text-fg-muted">
        Thornvale. Six paths. Hold Strike. The square finds the nearest foe.
      </p>
      <div className="mt-6 flex max-w-sm flex-col gap-2">
        <Button onClick={() => setScreen("login")}>Enter the Vale</Button>
        <Button variant="secondary" onClick={() => setScreen("how")}>
          How to play
        </Button>
        <div className="flex gap-2">
          <Button className="flex-1" variant="ghost" onClick={() => setScreen("scores")}>
            <Trophy className="size-4" /> Scores
          </Button>
          <Button className="flex-1" variant="ghost" onClick={() => setScreen("patches")}>
            <ScrollText className="size-4" /> Notes
          </Button>
        </div>
        <Link to="/" className="pt-2 text-center text-xs text-fg-muted">
          The House
        </Link>
      </div>
    </div>
  );
}

function Slots({ game }: { game: RefObject<GameHandle | null> }) {
  const roster = useGameStore((s) => s.roster);
  const beginCreate = useGameStore((s) => s.beginCreate);
  const selectSlot = useGameStore((s) => s.selectSlot);
  const deleteSlot = useGameStore((s) => s.deleteSlot);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="absolute inset-0 overflow-y-auto bg-bg/80 px-4 py-8 backdrop-blur-[2px] safe-screen">
      <div className="mx-auto w-full max-w-md">
        <p className="text-xs tracking-[0.22em] text-fg-muted uppercase">Four berths</p>
        <h2 className="mt-1 font-display text-3xl font-semibold">Who walks</h2>
        <SignInGate fallback={<AccountForm callbackURL="/play" />}>
          <ul className="mt-6 space-y-3">
            {roster.map((ch, i) => {
              if (ch) {
                return (
                  <li key={i} className="rounded-xl border border-border bg-surface p-4">
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        const keep = selectSlot(i);
                        if (!keep) return;
                        game.current?.startRun(keep.classId, keep.name, keep);
                      }}
                    >
                      <p className="font-medium">{ch.name}</p>
                      <p className="text-xs text-fg-muted">
                        {CLASSES[ch.classId].name} · lv {ch.level}
                      </p>
                    </button>
                    <button
                      type="button"
                      className="mt-2 text-xs text-fg-muted"
                      onClick={() => deleteSlot(i)}
                    >
                      Release this berth
                    </button>
                  </li>
                );
              }
              return (
                <li key={i} className="rounded-xl border border-dashed border-border bg-surface/50 p-4">
                  <button type="button" className="w-full text-left" onClick={() => beginCreate(i)}>
                    <p className="text-sm text-fg-muted">Empty berth {i + 1}</p>
                    <p className="mt-1 text-sm text-fg">Pick a path</p>
                  </button>
                </li>
              );
            })}
          </ul>
          <Button className="mt-6 w-full" variant="ghost" onClick={() => setScreen("title")}>
            Back
          </Button>
        </SignInGate>
      </div>
    </div>
  );
}

function ClassSelect({ game }: { game: RefObject<GameHandle | null> }) {
  const classId = useGameStore((s) => s.classId);
  const setClass = useGameStore((s) => s.setClass);
  const name = useGameStore((s) => s.playerName);
  const setName = useGameStore((s) => s.setName);
  const creatingSlot = useGameStore((s) => s.creatingSlot);
  const createActive = useGameStore((s) => s.createActive);
  const selectSlot = useGameStore((s) => s.selectSlot);
  const setScreen = useGameStore((s) => s.setScreen);
  const def = CLASSES[classId];
  const [err, setErr] = useState("");

  function go() {
    const slot = creatingSlot ?? 0;
    void (async () => {
      const fail = await createActive(slot, name, classId);
      if (fail) {
        setErr(fail);
        return;
      }
      game.current?.startRun(classId, name.trim());
    })();
  }

  return (
    <div className="absolute inset-0 overflow-y-auto bg-bg/80 px-4 py-8 backdrop-blur-[2px] safe-screen">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <p className="text-xs tracking-[0.22em] text-fg-muted uppercase">Pick your path</p>
          <h2 className="mt-1 font-display text-3xl font-semibold">The six of Thornvale</h2>
          <p className="mt-2 max-w-xl text-sm text-fg-muted">
            Hold Strike. The Vale finds the nearest foe and walks you into reach.
          </p>
        </div>
        <label className="block text-xs font-medium text-fg-muted">
          Name
          <input
            value={name}
            onChange={(e) => {
              setErr("");
              setName(e.target.value.slice(0, 18));
            }}
            autoComplete="off"
            className="mt-1 h-11 w-full rounded-md border border-border bg-surface-2 px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CLASS_ORDER.map((id) => {
            const c = CLASSES[id];
            const on = id === classId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setClass(id)}
                className={`rounded-xl border p-3 text-left ${on ? "border-primary bg-surface-2" : "border-border bg-surface"}`}
              >
                <img src={asset(`/sprites/classes/${id}.png`)} alt="" className="mb-2 h-16 w-16 object-cover object-top" />
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-fg-muted">{c.epithet}</p>
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="font-display text-xl">{def.name}</p>
          <p className="text-sm text-fg-muted">{def.blurb}</p>
          <p className="mt-2 text-xs text-fg-subtle">{def.vow}</p>
        </div>
        {err ? <p className="text-sm text-hp">{err}</p> : null}
        <Button onClick={go}>Walk</Button>
        <Button
          variant="ghost"
          onClick={() => {
            selectSlot(0);
            setScreen("login");
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

function Hud({ game, onPause }: { game: RefObject<GameHandle | null>; onPause: () => void }) {
  const hp = useGameStore((s) => s.hp);
  const maxHp = useGameStore((s) => s.maxHp);
  const mp = useGameStore((s) => s.mp);
  const maxMp = useGameStore((s) => s.maxMp);
  const gold = useGameStore((s) => s.gold);
  const level = useGameStore((s) => s.level);
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const toast = useGameStore((s) => s.toast);
  const targetName = useGameStore((s) => s.targetName);
  const targetHp = useGameStore((s) => s.targetHp);
  const targetMax = useGameStore((s) => s.targetMax);
  const inReach = useGameStore((s) => s.inReach);
  const combatHint = useGameStore((s) => s.combatHint);
  const locationId = useGameStore((s) => s.locationId);
  const prompt = useGameStore((s) => s.prompt);
  const walkers = useGameStore((s) => s.walkers);
  const clock = useGameStore((s) => s.clock);
  const huntName = useGameStore((s) => s.huntName);
  const overlay = useGameStore((s) => s.overlay);
  const objective = useGameStore((s) => s.objective);
  const training = useGameStore((s) => s.training);
  const idleLeft = useGameStore((s) => s.idleLeft);
  const here = settlement(locationId);
  const xpNeed = useGameStore((s) => s.xpNeed);
  const xpHave = useGameStore((s) => s.xp);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 safe-top">
      <div className="flex items-start justify-between gap-2 px-2">
        <div className="min-w-0 max-w-[70%] rounded-xl border border-border bg-bg/70 px-3 py-2 backdrop-blur-sm">
          <p className="text-[10px] tracking-[0.18em] text-fg-muted uppercase">
            {here.name} · {clock}
            {huntName ? ` · ${huntName}` : ""}
            {walkers ? ` · ${walkers} walking` : ""}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="tabular-nums text-hp">
              {Math.ceil(hp)}/{maxHp}
            </span>
            <span className="tabular-nums text-mp">
              {Math.ceil(mp)}/{maxMp}
            </span>
            <span className="tabular-nums text-fg-muted">lv {level}</span>
          </div>
          <Bar value={hp / (maxHp || 1)} color="bg-hp" label="hp" />
          <Bar value={mp / (maxMp || 1)} color="bg-mp" label="mp" />
          <Bar value={xpNeed ? Math.min(1, xpHave / xpNeed) : 0} color="bg-xp" label="xp" />
          <div className="mt-2 flex items-center justify-between text-xs text-fg-muted">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Heart className="size-3.5" /> {lives}
            </span>
            <span className="tabular-nums">Score {score}</span>
            <span className="tabular-nums">{formatCoins(gold)}</span>
          </div>
          {targetName ? (
            <div className="mt-2">
              <p className="truncate text-xs text-fg">
                {targetName}
                <span className="text-fg-muted"> · {inReach ? "in reach" : "closing"}</span>
              </p>
              <Bar value={targetMax ? targetHp / targetMax : 0} color="bg-hp" label="mark" />
            </div>
          ) : combatHint ? (
            <p className="mt-1 text-xs text-fg">{combatHint}</p>
          ) : null}
          {prompt ? (
            <button
              type="button"
              className="pointer-events-auto mt-2 min-h-11 w-full rounded-md border border-border bg-surface-2 px-3 text-left text-sm text-fg"
              onClick={() => game.current?.interact()}
            >
              {prompt.replace(" · E", "")} · tap
            </button>
          ) : null}
          {objective ? <p className="mt-1 text-xs text-fg-subtle">{objective}</p> : null}
          {training ? <p className="mt-1 text-xs text-fg">Training {training}</p> : null}
          {idleLeft > 0 && idleLeft <= 120 ? (
            <p className="mt-1 text-xs text-hp">
              Move or click · {Math.floor(idleLeft / 60)}:{String(idleLeft % 60).padStart(2, "0")}
            </p>
          ) : null}
          {toast ? <p className="mt-1 text-xs text-fg">{toast}</p> : null}
        </div>
        {overlay === "playing" ? (
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={onPause}
              className="pointer-events-auto flex size-11 items-center justify-center rounded-md border border-border bg-bg/80 text-fg"
              aria-label="Pause"
            >
              <Pause className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => useGameStore.getState().setOverlay("pack")}
              className="pointer-events-auto flex size-11 items-center justify-center rounded-md border border-border bg-bg/80 text-fg"
              aria-label="Pack"
            >
              <Backpack className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => useGameStore.getState().setOverlay("atlas")}
              className="pointer-events-auto flex size-11 items-center justify-center rounded-md border border-border bg-bg/80 text-fg"
              aria-label="Atlas"
            >
              <Map className="size-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Bar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="mt-1.5">
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className={`h-full ${color}`} style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

function CombatPad({ game }: { game: RefObject<GameHandle | null> }) {
  const abilities = useGameStore((s) => s.abilities);
  const prompt = useGameStore((s) => s.prompt);
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const [striking, setStriking] = useState(false);
  const origin = useRef<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    game.current?.input.setStick(stick.x, stick.y);
  }, [stick, game]);

  function endStick(id: number) {
    if (!origin.current || origin.current.id !== id) return;
    origin.current = null;
    setStick({ x: 0, y: 0 });
  }

  const orbit = [
    "left-1/2 top-0 -translate-x-1/2",
    "right-0 top-1/2 -translate-y-1/2",
    "left-1/2 bottom-0 -translate-x-1/2",
    "left-0 top-1/2 -translate-y-1/2",
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 safe-bottom">
      <div
        className="pointer-events-auto relative size-36 shrink-0 touch-none rounded-full border border-border bg-bg/55"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          const r = e.currentTarget.getBoundingClientRect();
          origin.current = { id: e.pointerId, x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }}
        onPointerMove={(e) => {
          if (!origin.current || origin.current.id !== e.pointerId) return;
          const dx = (e.clientX - origin.current.x) / 56;
          const dy = (e.clientY - origin.current.y) / 56;
          const len = Math.hypot(dx, dy) || 1;
          const s = Math.min(1, len);
          setStick({ x: (dx / len) * s, y: (dy / len) * s });
        }}
        onPointerUp={(e) => endStick(e.pointerId)}
        onPointerCancel={(e) => endStick(e.pointerId)}
      >
        <div
          className="absolute left-1/2 top-1/2 size-12 rounded-full bg-fg/45"
          style={{ transform: `translate(calc(-50% + ${stick.x * 36}px), calc(-50% + ${stick.y * 36}px))` }}
        />
      </div>
      <div className="pointer-events-auto flex items-end gap-2">
        <div className="mb-1 flex flex-col gap-2">
          <Button
            variant="secondary"
            className="h-12 min-w-12 px-3"
            onClick={() => useGameStore.getState().setChatOpen(true)}
          >
            Say
          </Button>
          <Button variant="secondary" className="h-12 min-w-12 px-3" onClick={() => game.current?.interact()}>
            {prompt ? "Use" : "Talk"}
          </Button>
        </div>
        <div className="relative size-44 shrink-0">
          {abilities.map((a, i) => (
            <button
              key={a.id}
              type="button"
              aria-label={a.name}
              onClick={() => game.current?.cast(i)}
              className={`absolute flex size-11 flex-col items-center justify-center overflow-hidden rounded-full border border-border bg-bg/80 text-center text-xs leading-tight text-fg ${orbit[i] ?? ""} ${a.can ? "" : "opacity-50"}`}
            >
              {a.ready < 1 ? (
                <span
                  className="absolute inset-x-0 bottom-0 bg-surface-3"
                  style={{ height: `${Math.round((1 - a.ready) * 100)}%` }}
                />
              ) : null}
              <span className="relative">{a.name}</span>
            </button>
          ))}
          <button
            type="button"
            aria-label="Strike"
            className={`absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-primary text-sm font-medium text-primary-foreground ${striking ? "scale-95" : ""}`}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setStriking(true);
              game.current?.setAttackHold(true);
            }}
            onPointerUp={() => {
              setStriking(false);
              game.current?.setAttackHold(false);
            }}
            onPointerCancel={() => {
              setStriking(false);
              game.current?.setAttackHold(false);
            }}
          >
            Strike
          </button>
        </div>
      </div>
    </div>
  );
}

function PauseMenu({ game }: { game: RefObject<GameHandle | null> }) {
  const settings = useGameStore((s) => s.settings);
  const setSettings = useGameStore((s) => s.setSettings);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const setScreen = useGameStore((s) => s.setScreen);
  const skills = useGameStore((s) => s.skills);

  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-y-auto bg-bg/70 px-4 py-4 backdrop-blur-[3px] sm:items-center safe-screen">
      <div className="mb-2 w-full max-w-sm rounded-2xl border border-border bg-surface p-5 sm:mb-0">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Paused</h2>
          <button type="button" className="size-10" onClick={() => game.current?.togglePause()} aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        {skills.length > 0 ? (
          <ul className="mt-4 space-y-1.5">
            {skills.map((sk) => (
              <li key={sk.id}>
                <div className="flex justify-between text-xs text-fg-muted">
                  <span>{sk.name}</span>
                  <span className="tabular-nums text-fg">{sk.level}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full bg-primary" style={{ width: `${Math.round(sk.progress * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-5 flex flex-col gap-3">
          <Button onClick={() => game.current?.togglePause()}>
            <Play className="size-4" /> Resume
          </Button>
          <Button variant="secondary" onClick={() => setOverlay("atlas")}>
            <Map className="size-4" /> Atlas
          </Button>
          <Button variant="secondary" onClick={() => setOverlay("who")}>
            <Users className="size-4" /> Who
          </Button>
          <Button variant="secondary" onClick={() => setOverlay("pack")}>
            Pack
          </Button>
          <Button variant="secondary" onClick={() => setOverlay("gear")}>
            Equipment
          </Button>
          <Button variant="secondary" onClick={() => setScreen("scores")}>
            High scores
          </Button>
          <Button variant="secondary" onClick={() => setScreen("patches")}>
            Patch notes
          </Button>
          <label className="text-xs text-fg-muted">
            Effects
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.sfx}
              onChange={(e) => setSettings({ sfx: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </label>
          <label className="text-xs text-fg-muted">
            Music
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.music}
              onChange={(e) => setSettings({ music: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.shake}
              onChange={(e) => setSettings({ shake: e.target.checked })}
            />
            Screen shake
          </label>
          <Button
            variant="ghost"
            onClick={() => {
              game.current?.leaveRealm();
              setScreen("title");
            }}
          >
            Leave the Vale
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatDock({ game }: { game: RefObject<GameHandle | null> }) {
  const open = useGameStore((s) => s.chatOpen);
  const log = useGameStore((s) => s.chatLog);
  const setChatOpen = useGameStore((s) => s.setChatOpen);
  const [text, setText] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  const recent = log.slice(-6);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-36 z-10 px-3 sm:bottom-8">
      <div className="mx-auto w-full max-w-md">
        {recent.length > 0 ? (
          <ul className="mb-2 space-y-0.5 rounded-md bg-bg/55 px-3 py-2 text-xs">
            {recent.map((line, i) => (
              <li key={`${line.at}-${i}`}>
                <span className="text-fg">{line.from}</span>
                <span className="text-fg-muted"> · {line.text}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {open ? (
          <form
            className="pointer-events-auto"
            onSubmit={(e) => {
              e.preventDefault();
              const t = text.trim();
              if (t) game.current?.say(t);
              setText("");
              setChatOpen(false);
            }}
          >
            <input
              ref={ref}
              value={text}
              maxLength={80}
              placeholder="Say — Enter sends, Esc closes"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setChatOpen(false);
                }
              }}
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-ring"
            />
          </form>
        ) : null}
      </div>
    </div>
  );
}

function Who() {
  const who = useGameStore((s) => s.who);
  const me = useGameStore((s) => s.playerName);
  const classId = useGameStore((s) => s.classId);
  const level = useGameStore((s) => s.level);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const rows = [{ name: me, className: CLASSES[classId].name, level, ping: null as number | null }, ...who];
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg/70 px-4 safe-screen">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-2xl font-semibold">Who</h2>
        <p className="mt-1 text-xs text-fg-muted">The realm. Same square, same night.</p>
        <ul className="mt-4 space-y-2">
          {rows.map((w, i) => (
            <li key={`${w.name}-${i}`} className="flex justify-between text-sm">
              <span>
                {w.name}
                {i === 0 ? " · you" : ""} · {w.className}
              </span>
              <span className="tabular-nums text-fg-muted">lv {w.level}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-6 w-full" variant="secondary" onClick={() => setOverlay("playing")}>
          Close
        </Button>
      </div>
    </div>
  );
}

function Talk({ game }: { game: RefObject<GameHandle | null> }) {
  const npc = useGameStore((s) => s.talkNpc) as Npc | null;
  const pack = useGameStore((s) => s.pack);
  const setOverlay = useGameStore((s) => s.setOverlay);
  if (!npc) return null;
  const job = jobNeed(npc.role);
  const have = job ? pack.find((s) => s.item === job.item)?.qty ?? 0 : 0;
  return (
    <div className="absolute inset-0 flex items-end justify-center bg-bg/50 px-4 pb-8 sm:items-center sm:pb-0 safe-screen">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <p className="text-xs tracking-[0.18em] text-fg-muted uppercase">{roleLabel(npc.role)}</p>
        <h2 className="font-display text-2xl font-semibold">{npc.name}</h2>
        <p className="text-sm text-fg-subtle">{npc.epithet}</p>
        <p className="mt-3 text-sm leading-relaxed text-fg">{npc.line}</p>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">{npc.aside}</p>
        <div className="mt-5 flex flex-col gap-2">
          {npc.role === "inn" ? <Button onClick={() => game.current?.restInn()}>Rest — free</Button> : null}
          {shopIdFromRole(npc.role) ? (
            <Button onClick={() => game.current?.openShop(shopIdFromRole(npc.role)!)}>Trade</Button>
          ) : null}
          {job ? (
            <Button variant="secondary" onClick={() => game.current?.turnIn()} disabled={have < job.qty}>
              Hand over {job.qty} · {formatCoins(job.pay)}
              {have < job.qty ? ` (${have}/${job.qty})` : ""}
            </Button>
          ) : null}
          {npc.role === "fish" ? (
            <Button
              variant="ghost"
              onClick={() => {
                setOverlay("playing");
                game.current?.fish();
              }}
            >
              Fish here
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => setOverlay("playing")}>
            Walk on
          </Button>
        </div>
      </div>
    </div>
  );
}

function Pack({ game }: { game: RefObject<GameHandle | null> }) {
  const pack = useGameStore((s) => s.pack);
  const worn = useGameStore((s) => s.worn);
  const setOverlay = useGameStore((s) => s.setOverlay);
  return (
    <div className="absolute inset-0 overflow-y-auto bg-bg/80 px-4 py-8 safe-screen">
      <div className="mx-auto w-full max-w-md">
        <h2 className="font-display text-2xl font-semibold">Pack</h2>
        <ul className="mt-4 space-y-2">
          {SLOT_ORDER.map((slot: EquipSlot) => {
            const id = worn[slot];
            const d = id ? ITEMS[id] : null;
            return (
              <li key={slot} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                <span className="text-fg-muted">{slot}</span>
                {d ? (
                  <button type="button" className="text-fg" onClick={() => game.current?.unequip(slot)}>
                    {d.name}
                  </button>
                ) : (
                  <span className="text-fg-subtle">empty</span>
                )}
              </li>
            );
          })}
        </ul>
        <ul className="mt-4 space-y-2">
          {pack.length === 0 ? <li className="text-sm text-fg-muted">Nothing in the pack.</li> : null}
          {pack.map((s, i) => {
            const d = ITEMS[s.item];
            if (!d) return null;
            return (
              <li key={`${s.item}-${i}`} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                <span>
                  {d.name} {s.qty > 1 ? `×${s.qty}` : ""}
                </span>
                <span className="flex gap-2">
                  {d.kind === "gear" ? (
                    <Button size="sm" onClick={() => game.current?.equip(s.item)}>
                      Wear
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => game.current?.useItem(s.item)}>
                      Use
                    </Button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <Button className="mt-6 w-full" variant="secondary" onClick={() => setOverlay("playing")}>
          Close
        </Button>
      </div>
    </div>
  );
}

function GearCodex() {
  const setOverlay = useGameStore((s) => s.setOverlay);
  const level = useGameStore((s) => s.level);
  const hudSkills = useGameStore((s) => s.skills);
  const skills = {
    fight: { level: hudSkills.find((s) => s.id === "fight")?.level ?? 10, tries: 0 },
    magic: { level: hudSkills.find((s) => s.id === "magic")?.level ?? 0, tries: 0 },
    shielding: { level: hudSkills.find((s) => s.id === "shielding")?.level ?? 10, tries: 0 },
  };
  return (
    <div className="absolute inset-0 overflow-y-auto bg-bg/80 px-4 py-8 safe-screen">
      <div className="mx-auto w-full max-w-md">
        <h2 className="font-display text-2xl font-semibold">Equipment</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Combat 1–100. Common through relic. Wear needs combat level and a skill.
        </p>
        <ul className="mt-4 space-y-1">
          {LADDER.slice(0, 24).map((d) => {
            const why = d.kind === "gear" ? canWear(d, level, skills) : null;
            return (
              <li key={d.id} className="flex justify-between gap-2 text-xs">
                <span className={RARITY_CLASS[d.rarity ?? "common"]}>
                  {d.name}
                  <span className="ml-2 text-fg-muted">{RARITY_LABEL[d.rarity ?? "common"]}</span>
                </span>
                <span className="text-fg-muted">{why ?? `lv ${d.levelReq}`}</span>
              </li>
            );
          })}
        </ul>
        <Button className="mt-6 w-full" variant="secondary" onClick={() => setOverlay("playing")}>
          Close
        </Button>
      </div>
    </div>
  );
}

function Atlas({ game }: { game: RefObject<GameHandle | null> }) {
  const locationId = useGameStore((s) => s.locationId);
  const gold = useGameStore((s) => s.gold);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const here = settlement(locationId);
  const [cont, setCont] = useState<ContinentId>(here.continent);
  const roads = passagesFrom(locationId);
  return (
    <div className="absolute inset-0 overflow-y-auto bg-bg/80 px-4 py-8 safe-screen">
      <div className="mx-auto w-full max-w-md">
        <h2 className="font-display text-2xl font-semibold">Atlas</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONTINENT_ORDER.map((id) => (
            <Button key={id} size="sm" variant={id === cont ? "default" : "secondary"} onClick={() => setCont(id)}>
              {CONTINENTS[id].name}
            </Button>
          ))}
        </div>
        <ul className="mt-4 space-y-2">
          {listContinent(cont).map((s) => (
            <li key={s.id}>
              <Button
                className="w-full justify-between"
                variant={s.id === locationId ? "default" : "secondary"}
                onClick={() => {
                  const pass = roads.find((r) => otherEnd(r, locationId) === s.id);
                  game.current?.travelTo(s.id, pass?.mode ?? "ship", pass?.gold ?? 8);
                  setOverlay("playing");
                }}
                disabled={s.id === locationId}
              >
                {s.name}
                {s.id === locationId ? " · here" : ""}
              </Button>
            </li>
          ))}
        </ul>
        <Button className="mt-6 w-full" variant="ghost" onClick={() => setOverlay("playing")}>
          Close
        </Button>
      </div>
    </div>
  );
}

function GameOver({ game }: { game: RefObject<GameHandle | null> }) {
  const setScreen = useGameStore((s) => s.setScreen);
  const name = useGameStore((s) => s.playerName);
  const score = useGameStore((s) => s.score);
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg/80 px-4 safe-screen">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-2xl font-semibold">The hunt ends</h2>
        <p className="mt-2 text-sm text-fg-muted">
          {name}. Score {score}. Coin and gear stay two hours.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={() => game.current?.retryRun()}>Rise</Button>
          <Button variant="secondary" onClick={() => setScreen("title")}>
            Title
          </Button>
        </div>
      </div>
    </div>
  );
}

function Scores({ back }: { back: "title" | "paused" }) {
  const scores = useGameStore((s) => s.scores);
  const setScreen = useGameStore((s) => s.setScreen);
  return (
    <div className="absolute inset-0 overflow-y-auto bg-bg/80 px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <h2 className="font-display text-2xl font-semibold">High scores</h2>
        <ul className="mt-4 space-y-2">
          {scores.length === 0 ? <li className="text-sm text-fg-muted">No names on the stone yet.</li> : null}
          {scores.map((s, i) => (
            <li key={`${s.name}-${s.date}-${i}`} className="flex justify-between text-sm">
              <span>
                {s.name} · {CLASSES[s.classId].name}
              </span>
              <span className="tabular-nums text-fg-muted">
                lv {s.level} · {s.score}
              </span>
            </li>
          ))}
        </ul>
        <Button className="mt-6 w-full" variant="secondary" onClick={() => setScreen(back)}>
          Back
        </Button>
      </div>
    </div>
  );
}

function PatchNotes({ back }: { back: "title" | "paused" }) {
  const setScreen = useGameStore((s) => s.setScreen);
  return (
    <div className="absolute inset-0 overflow-y-auto bg-bg/80 px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <h2 className="font-display text-2xl font-semibold">Patch notes</h2>
        <p className="mt-3 text-sm text-fg">Hold Strike. The Vale finds the nearest foe. Skills sit around the button.</p>
        <p className="mt-2 text-sm text-fg-muted">Book One stays free.</p>
        <Button className="mt-6 w-full" variant="secondary" onClick={() => setScreen(back)}>
          Back
        </Button>
      </div>
    </div>
  );
}

function HowTo() {
  const setScreen = useGameStore((s) => s.setScreen);
  return (
    <div className="absolute inset-0 overflow-y-auto bg-bg/80 px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <h2 className="font-display text-2xl font-semibold">How to play</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-fg">
          <li>Hold Strike. You face the nearest beast, walk into reach, and keep hitting until you let go.</li>
          <li>Tap a beast to lock it. Skills sit around Strike. Keys 1–4 on a keyboard.</li>
          <li>On a phone: left stick walks, Strike holds the hunt, Talk uses the prompt.</li>
          <li>WASD or the stick. Click to walk on a mouse. E to talk, enter, take.</li>
          <li>West of the fountain is Nettle Copse — a first hunt.</li>
          <li>Enter to say. Pause → Who. Book One stays free.</li>
        </ul>
        <Button className="mt-6 w-full" variant="secondary" onClick={() => setScreen("title")}>
          Back
        </Button>
      </div>
    </div>
  );
}
