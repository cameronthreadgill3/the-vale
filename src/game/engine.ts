import { awardedXp, levelFromXp, progressInLevel, totalXpForLevel, xpToNext } from "./xp";
import { CLASSES, ENEMIES, abilityShort, type ClassId, type EnemyKind } from "./classes";
import { asset } from "./assets";
import {
  CONTINENTS,
  START_ID,
  settlement,
  type TravelMode,
} from "./atlas";
import {
  ITEMS,
  addToPack,
  canWear,
  emptyWorn,
  emptyVault,
  rollLoot,
  sanitizeWorn,
  sellPrice,
  takeFromPack,
  stashInVault,
  takeFromVault,
  wornBonuses,
  SLOT_ORDER,
  type InvStack,
  type ItemId,
  type Loadout,
  type EquipSlot,
  type Vault,
} from "./items";
import { listGroundLoot, postGroundLoot, takeGroundLoot, type GroundDrop } from "./drops";
import { formatCoins } from "./money";
import { shopBuys, shopIdFromProp, shopIdFromRole, SHOPS, type ShopId } from "./shops";
import {
  VOCATION,
  addTries,
  attackInterval,
  cloneSkills,
  defaultSkills,
  loseSkillProgress,
  rollFightHit,
  rollHeal,
  rollSpellHit,
  sanitizeSkills,
  shieldBonus,
  skillProgress,
  spellInterval,
  trainManaPerSec,
  type SkillSet,
} from "./skills";
import { ValeNet } from "./net";
import { generateDungeon } from "./dungeon";
import {
  dungeonFor,
  ENEMY_SPRITE_IDS,
  groundAt,
  isRangedKind,
  pickFromPack,
  THEME_LIGHT,
  threeHourKeep,
} from "./bestiary";
import { createInput, type Input } from "./input";
import {
  blockedAt,
  generateWorld,
  inTown,
  TILE,
  MAP_W,
  MAP_H,
  tryMove,
  tileAt,
  T_WATER,
  type World,
  type WorldProp,
} from "./world";
import { clockLabel, jobNeed, nightVeil, type Npc } from "./life";
import { huntFit, liveObjective, nearestGround } from "./guide";
import { useGameStore } from "./store";
import * as Sfx from "./audio";

type SpriteSheet = { img: HTMLImageElement; cols: number; rows: number };

type Actor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  facing: number;
  hp: number;
  maxHp: number;
  flash: number;
  stun: number;
  slow: number;
  walkT: number;
};

type Enemy = Actor & {
  alive: boolean;
  kind: EnemyKind;
  level: number;
  cd: number;
  aggro: boolean;
  title?: string;
  elite?: boolean;
  boss?: boolean;
};

type Bolt = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  dmg: number;
  r: number;
  sprite: "arrow" | "fireball" | "holy" | "ice";
  aoe: number;
  stun: number;
  slow: number;
  fromPlayer: boolean;
};

type Puff = { alive: boolean; x: number; y: number; vx: number; vy: number; ttl: number; max: number; c: string; s: number };
type Floater = { alive: boolean; x: number; y: number; ttl: number; max: number; text: string; c: string };

type Sprites = {
  classes: Record<string, SpriteSheet>;
  enemies: Record<string, SpriteSheet>;
  fx: Record<string, SpriteSheet>;
  props: SpriteSheet | null;
  propImgs: Partial<Record<WorldProp["kind"], HTMLImageElement>>;
  npcImgs: Partial<Record<string, HTMLImageElement>>;
  chest: HTMLImageElement | null;
  tiles: HTMLImageElement | null;
  tileCell: number;
};

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

async function loadSheet(src: string, cols: number, rows: number): Promise<SpriteSheet | null> {
  try {
    const img = await loadImg(src);
    return { img, cols, rows };
  } catch {
    return null;
  }
}

async function loadAll(): Promise<Sprites> {
  const classes: Sprites["classes"] = {};
  const enemies: Sprites["enemies"] = {};
  const fx: Sprites["fx"] = {};
  const [w, a, m, h, p, k] = await Promise.all(
    ["warrior", "archer", "mage", "healer", "paladin", "monk"].map((id) =>
      loadSheet(asset(`/sprites/classes/${id}.png`), 4, 4),
    ),
  );
  if (w) classes.warrior = w;
  if (a) classes.archer = a;
  if (m) classes.mage = m;
  if (h) classes.healer = h;
  if (p) classes.paladin = p;
  if (k) classes.monk = k;
  const [g, wo, sk, o, d, wi, wg, ci, cr, sh, hg, hk] = await Promise.all(
    ENEMY_SPRITE_IDS.map((id) => loadSheet(asset(`/sprites/enemies/${id}.png`), 2, 2)),
  );
  const loaded = [g, wo, sk, o, d, wi, wg, ci, cr, sh, hg, hk];
  ENEMY_SPRITE_IDS.forEach((id, i) => {
    const sheet = loaded[i];
    if (sheet) enemies[id] = sheet;
  });
  const [fb, ar, ho, ice, im] = await Promise.all(
    ["fireball", "arrow", "holy", "ice", "impact"].map((id) => loadSheet(asset(`/sprites/fx/${id}.png`), 2, 2)),
  );
  if (fb) fx.fireball = fb;
  if (ar) fx.arrow = ar;
  if (ho) fx.holy = ho;
  if (ice) fx.ice = ice;
  if (im) fx.impact = im;
  const props = await loadSheet(asset("/sprites/props/pack.png"), 2, 2);
  const propImgs: Sprites["propImgs"] = {};
  await Promise.all(
    (["fountain", "tree", "house", "cottage", "hall", "inn", "mill", "bank", "cairn", "ruin", "shop", "stall", "hides", "magicshop", "armory", "fletcher", "well", "lantern", "barrel", "crate", "dock", "portal", "bench", "rock", "herb", "dummy", "shieldpost", "manafont"] as const).map(
      async (kind) => {
        try {
          propImgs[kind] = await loadImg(asset(`/sprites/props/${kind}.png`));
        } catch {
          /* keep fallback */
        }
      },
    ),
  );
  const npcImgs: Sprites["npcImgs"] = {};
  await Promise.all(
    (["hides", "magic", "armory", "fletcher"] as const).map(async (role) => {
      try {
        npcImgs[role] = await loadImg(asset(`/sprites/props/npc-${role}.png`));
      } catch {
        /* keep blob */
      }
    }),
  );
  let chest: HTMLImageElement | null = null;
  let tiles: HTMLImageElement | null = null;
  try {
    chest = await loadImg(asset("/sprites/props/chest.png"));
  } catch {
    chest = null;
  }
  try {
    tiles = await loadImg(asset("/tiles/atlas.png"));
  } catch {
    tiles = null;
  }
  const tileCell = tiles ? Math.max(16, (tiles.width / 4) | 0) : 32;
  return { classes, enemies, fx, props, propImgs, npcImgs, chest, tiles, tileCell };
}

function dirRow(facing: number) {
  const ux = Math.sin(facing);
  const uy = -Math.cos(facing);
  if (Math.abs(ux) > Math.abs(uy)) return ux < 0 ? 1 : 2;
  return uy > 0 ? 0 : 3;
}

function drawSheet(
  ctx: CanvasRenderingContext2D,
  sheet: SpriteSheet | undefined,
  col: number,
  row: number,
  x: number,
  y: number,
  size: number,
  flash = 0,
) {
  if (!sheet) {
    ctx.fillStyle = flash > 0 ? "#fff" : "#c5c8be";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const cw = sheet.img.width / sheet.cols;
  const ch = sheet.img.height / sheet.rows;
  ctx.save();
  if (flash > 0) ctx.filter = "brightness(2.4)";
  ctx.drawImage(sheet.img, (col % sheet.cols) * cw, (row % sheet.rows) * ch, cw, ch, x - size / 2, y - size * 0.72, size, size);
  ctx.restore();
}

function drawImg(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (!img) return false;
  ctx.drawImage(img, x - w / 2, y - h * 0.84, w, h);
  return true;
}

function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  ctx.fillStyle = "rgba(8, 10, 8, 0.38)";
  ctx.beginPath();
  ctx.ellipse(x, y + 8, r, r * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function createGame(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;

  const input = createInput(canvas);
  const net = new ValeNet();
  net.listen((line) => useGameStore.getState().pushChat(line));
  net.listenLoot((msg) => {
    if (msg.k === "x") {
      world.props = world.props.filter((p) => p.loot?.id !== msg.id);
      return;
    }
    if (msg.x == null || msg.y == null || msg.expires == null) return;
    addDropFromNet({
      id: msg.id,
      x: msg.x,
      y: msg.y,
      item: msg.item,
      qty: msg.qty,
      gold: msg.gold,
      expires: msg.expires,
    });
  });
  let netT = 0;
  let world: World = generateWorld(settlement(START_ID).seed, {
    biome: "vale",
    kind: "city",
    shop: true,
    name: "Thornhearth",
    locationId: START_ID,
  });
  const spritesP = loadAll();
  let sprites: Sprites | null = null;
  spritesP.then((s) => {
    sprites = s;
  });

  let running = true;
  let last = performance.now();
  let acc = 0;
  const STEP = 1 / 60;
  let hudT = 0;
  let saveT = 0;
  let spawnT = 0;
  let trauma = 0;
  let hitstop = 0;
  let destMark: { x: number; y: number; ttl: number } | null = null;
  let attackHeld = false;
  let combatTaught = false;
  let lastHunt = "";
  let lastUnique = "";
  let stepT = 0;
  let fountainHum = 0;
  let lowHpTold = false;
  let animT = 0;
  let toastT = 0;
  const IDLE_MS = 30 * 60 * 1000;
  let lastActivity = performance.now();
  let idleWarned = false;
  let training: { kind: "fight" | "magic" | "shielding"; x: number; y: number } | null = null;
  let trainAcc = 0;

  function bumpIdle() {
    lastActivity = performance.now();
    idleWarned = false;
  }

  const player: Actor & {
    mp: number;
    maxMp: number;
    xp: number;
    level: number;
    score: number;
    lives: number;
    classId: ClassId;
    attackCd: number;
    cds: number[];
    iframes: number;
    buffArmor: number;
    shield: number;
    hot: number;
    walkTarget: { x: number; y: number } | null;
    target: Enemy | null;
    skills: SkillSet;
    gold: number;
    pack: InvStack[];
    worn: Loadout;
    vaultCopper: number;
    vault: Vault;
    locationId: string;
    sitting: boolean;
    lockOn: boolean;
    pendingCast: number | null;
    swingT: number;
  } = {
    x: world.townX,
    y: world.townY + 120,
    vx: 0,
    vy: 0,
    r: 12,
    facing: 0,
    hp: 130,
    maxHp: 130,
    flash: 0,
    stun: 0,
    slow: 0,
    walkT: 0,
    mp: 40,
    maxMp: 40,
    xp: 0,
    level: 1,
    score: 0,
    lives: 3,
    classId: "warrior",
    attackCd: 0,
    cds: [0, 0, 0, 0],
    iframes: 0,
    buffArmor: 0,
    shield: 0,
    hot: 0,
    walkTarget: null,
    target: null,
    skills: defaultSkills("warrior"),
    gold: 25,
    pack: [],
    worn: emptyWorn(),
    vaultCopper: 0,
    vault: emptyVault(),
    locationId: START_ID,
    sitting: false,
    lockOn: false,
    pendingCast: null,
    swingT: 0,
  };

  const enemies: Enemy[] = Array.from({ length: 48 }, () => ({
    alive: false,
    kind: "goblin",
    level: 1,
    cd: 0,
    aggro: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 14,
    facing: 0,
    hp: 1,
    maxHp: 1,
    flash: 0,
    stun: 0,
    slow: 0,
    walkT: 0,
  }));
  const bolts: Bolt[] = Array.from({ length: 80 }, () => ({
    alive: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    ttl: 0,
    dmg: 0,
    r: 8,
    sprite: "fireball",
    aoe: 0,
    stun: 0,
    slow: 0,
    fromPlayer: true,
  }));
  const puffs: Puff[] = Array.from({ length: 180 }, () => ({
    alive: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    ttl: 0,
    max: 1,
    c: "#fff",
    s: 3,
  }));
  const floats: Floater[] = Array.from({ length: 40 }, () => ({
    alive: false,
    x: 0,
    y: 0,
    ttl: 0,
    max: 0.8,
    text: "",
    c: "#fff",
  }));

  const cam = { x: player.x, y: player.y };

  function persist() {
    const st = useGameStore.getState();
    if (st.activeSlot == null) return;
    st.saveProgress({
      level: player.level,
      xp: player.xp,
      score: player.score,
      skills: cloneSkills(player.skills),
      gold: player.gold,
      pack: player.pack.map((s) => ({ ...s })),
      worn: { ...player.worn },
      vaultCopper: player.vaultCopper,
      vault: player.vault.map((s) => (s ? { ...s } : null)),
      locationId: player.locationId,
    });
  }

  function bonuses() {
    return wornBonuses(player.worn, player.level, player.skills);
  }

  function applyClass(id: ClassId, fill = true) {
    const c = CLASSES[id];
    player.classId = id;
    const g = bonuses();
    player.maxHp = c.hp + (player.level - 1) * 8 + g.hp;
    player.maxMp = c.mp + (player.level - 1) * 4 + g.mp;
    if (fill) {
      player.hp = player.maxHp;
      player.mp = player.maxMp;
    } else {
      player.hp = Math.min(player.hp, player.maxHp);
      player.mp = Math.min(player.mp, player.maxMp);
    }
  }

  function loadLocation(id: string) {
    const s = settlement(id);
    const cont = CONTINENTS[s.continent];
    world = generateWorld(s.seed, {
      biome: cont.biome,
      kind: s.kind,
      port: s.port,
      portal: s.portal,
      shop: s.shop,
      name: s.name,
      locationId: s.id,
    });
    player.locationId = s.id;
    placeAtFountain();
    for (const e of enemies) e.alive = false;
    for (const b of bolts) b.alive = false;
    bindRealm();
    pullGroundLoot();
  }

  function bindRealm() {
    const name = useGameStore.getState().playerName || "Walker";
    net.enter(player.locationId, name);
  }

  function leaveRealm() {
    net.leave();
    useGameStore.getState().pulse({ walkers: 0, who: [] });
  }

  function travelTo(id: string, mode: TravelMode, gold: number) {
    if (id === player.locationId) return false;
    if (player.gold < gold) {
      toast("Not enough coin.");
      return false;
    }
    player.gold -= gold;
    loadLocation(id);
    persist();
    const s = settlement(id);
    const word = mode === "ship" ? "The ship makes land." : mode === "gate" ? "The circle takes you." : "The road ends.";
    toast(`${word} ${s.name}.`);
    useGameStore.getState().pulse({ locationId: s.id, gold: player.gold, overlay: "playing", screen: "playing" });
    return true;
  }

  function nearProp(kind: WorldProp["kind"], r = 40) {
    for (const p of world.props) {
      if (p.kind !== kind) continue;
      if (Math.hypot(p.x - player.x, p.y - player.y) < r) return p;
    }
    return null;
  }

  function lifePrompt(): string {
    if (world.underground) {
      return Math.hypot(player.x - world.townX, player.y - world.townY) < 64
        ? `Climb · E  ·  ${world.dungeon?.name ?? "The hollow"}`
        : world.dungeon?.name ?? "The hollow";
    }
    if (player.sitting) return "Stand · E";
    const npc = nearNpc();
    if (npc) return `${npc.name} · E`;
    if (nearProp("herb", 32) && !nearProp("herb", 32)?.taken) return "Pick · E";
    if (nearProp("bench", 32)) return "Sit · E";
    if (nearWater()) return "Fish · E";
    if (nearProp("cairn", 52)) {
      const c = nearProp("cairn", 52);
      return c?.label ? `${c.label} · hunt` : "A hunt marker";
    }
    if (training) return "Stop training · E";
    if (nearProp("dummy", 48)) return `${vocation().fightName} · E`;
    if (nearProp("shieldpost", 48)) return "Shielding · E";
    if (nearProp("manafont", 48)) return "Magic Level · E";
    if (nearProp("ruin", 48)) {
      const spec = dungeonFor(player.locationId);
      return `Descend · E  ·  ${spec.name}`;
    }
    if (nearProp("drop", 36)) {
      const d = nearProp("drop", 36);
      return d?.label ? `Take ${d.label} · E` : "Take · E";
    }
    if (nearProp("magicshop", 52)) return "The weave · E";
    if (nearProp("armory", 52)) return "Iron · E";
    if (nearProp("fletcher", 52)) return "Greenpath · E";
    if (nearProp("bank", 48)) return "Bank · E";
    if (nearProp("inn", 48)) return "Inn · E";
    if (nearProp("mill", 48)) return "Mill · E";
    if (nearProp("house", 48) || nearProp("cottage", 48) || nearProp("hall", 48)) return "Enter · E";
    if (nearProp("dock", 50)) return "Ships · E";
    if (nearProp("portal", 48)) return "Gate · E";
    if (Math.hypot(player.x - world.townX, player.y - world.townY) < 48) return "The fountain mends you · Atlas · E";
    return "";
  }

  function nearNpc(r = 40): Npc | null {
    for (const n of world.npcs ?? []) {
      if (Math.hypot(n.x - player.x, n.y - player.y) < r) return n;
    }
    return null;
  }

  function nearWater() {
    for (const [ox, oy] of [[0, 0], [28, 0], [-28, 0], [0, 28], [0, -28]] as const) {
      if (tileAt(world, player.x + ox, player.y + oy) >= T_WATER && tileAt(world, player.x + ox, player.y + oy) <= T_WATER + 1) return true;
    }
    return false;
  }

  function tryInteract() {
    const st = useGameStore.getState();
    if (st.screen !== "playing") return;
    if (world.underground) {
      if (nearProp("stairs", 48) || Math.hypot(player.x - world.townX, player.y - world.townY) < 52) {
        leaveDungeon();
      }
      return;
    }
    if (training) {
      stopTrain();
      return;
    }
    const dummy = nearProp("dummy", 48);
    if (dummy) {
      startTrain("fight", dummy);
      return;
    }
    const shield = nearProp("shieldpost", 48);
    if (shield) {
      startTrain("shielding", shield);
      return;
    }
    const font = nearProp("manafont", 48);
    if (font) {
      startTrain("magic", font);
      return;
    }
    const npc = nearNpc();
    if (npc) {
      st.pulse({ talkNpc: npc, overlay: "talk" });
      return;
    }
    const drop = nearProp("drop", 36);
    if (drop) {
      takeDrop(drop);
      return;
    }
    const herb = nearProp("herb", 32);
    if (herb && !herb.taken) {
      pickHerb(herb);
      return;
    }
    if (nearProp("bench", 32)) {
      sitDown();
      return;
    }
    if (nearWater()) {
      fish();
      return;
    }
    if (nearProp("ruin", 48)) {
      enterDungeon();
      return;
    }
    if (nearProp("shop", 44) || nearProp("stall", 40) || nearProp("hides", 48)) {
      openShop("hides");
      return;
    }
    if (nearProp("magicshop", 52)) {
      openShop("magic");
      return;
    }
    if (nearProp("armory", 52)) {
      openShop("armory");
      return;
    }
    if (nearProp("fletcher", 52)) {
      openShop("fletcher");
      return;
    }
    if (nearProp("bank", 48)) {
      st.setOverlay("bank");
      return;
    }
    if (nearProp("inn", 48)) {
      st.setOverlay("inn");
      return;
    }
    if (nearProp("mill", 48)) {
      st.setOverlay("mill");
      return;
    }
    if (nearProp("house", 48) || nearProp("cottage", 48) || nearProp("hall", 48)) {
      st.setOverlay("house");
      return;
    }
    if (nearProp("dock", 50) || nearProp("portal", 48) || Math.hypot(player.x - world.townX, player.y - world.townY) < 64) {
      st.setOverlay("atlas");
    }
  }

  function startTrain(kind: "fight" | "magic" | "shielding", p: WorldProp) {
    player.sitting = false;
    player.walkTarget = null;
    player.target = null;
    player.lockOn = false;
    player.pendingCast = null;
    training = { kind, x: p.x, y: p.y };
    trainAcc = 0;
    const v = vocation();
    const name = kind === "fight" ? v.fightName : kind === "magic" ? "Magic Level" : "Shielding";
    toast(`Training ${name}. Click or walk every half hour.`);
  }

  function stopTrain() {
    if (!training) return;
    training = null;
    trainAcc = 0;
    persist();
    toast("You step off the post.");
  }

  function tickTrain(dt: number) {
    if (!training) return;
    const v = vocation();
    if (training.kind === "fight") {
      trainAcc += dt;
      const swing = attackInterval(CLASSES[player.classId].attackCd, player.skills.fight.level, v.fightStart);
      while (trainAcc >= swing) {
        trainAcc -= swing;
        trainFight(1);
        puff(training.x, training.y - 18, "rgba(200,180,140,0.45)", 4, 16);
        Sfx.sfxSwing();
      }
      return;
    }
    if (training.kind === "shielding") {
      trainAcc += dt;
      while (trainAcc >= 2) {
        trainAcc -= 2;
        trainShield();
        puff(player.x, player.y - 10, "rgba(160,170,180,0.4)", 3, 14);
      }
      return;
    }
    const rate = trainManaPerSec(player.classId);
    const spent = Math.min(player.mp + rate * dt, rate * dt);
    player.mp = Math.min(player.maxMp, player.mp + rate * dt - spent);
    if (spent > 0) trainMagic(spent);
  }

  function idleKick() {
    persist();
    training = null;
    attackHeld = false;
    Sfx.stopMusic();
    useGameStore.getState().pulse({
      screen: "title",
      overlay: "title",
      toast: "You stood still too long. The Vale logged you out.",
      training: "",
      idleLeft: 0,
    });
  }

  function idleTick() {
    const st = useGameStore.getState();
    if (st.screen !== "playing" && st.screen !== "paused") return;
    const left = IDLE_MS - (performance.now() - lastActivity);
    const sec = Math.max(0, Math.ceil(left / 1000));
    const label = training
      ? training.kind === "fight"
        ? vocation().fightShort
        : training.kind === "magic"
          ? "Magic"
          : "Shield"
      : "";
    if (st.idleLeft !== sec || st.training !== label) {
      st.pulse({ idleLeft: sec, training: label });
    }
    if (left <= 0) {
      idleKick();
      return;
    }
    if (left <= 120000 && !idleWarned) {
      idleWarned = true;
      toast("Move or click. Two minutes, then the Vale logs you out.");
    }
  }

  function sitDown() {
    player.sitting = !player.sitting;
    player.walkTarget = null;
    toast(player.sitting ? "You sit. The square goes on." : "Up.");
  }

  function pickHerb(p: WorldProp) {
    const packed = addToPack(player.pack, "copse_herb", 1);
    if (!packed) {
      toast("Pack is full.");
      return;
    }
    p.taken = true;
    player.pack = packed;
    persist();
    useGameStore.getState().pulse({ pack: player.pack });
    toast("Copse herb. Green at the edge.");
  }

  function fish() {
    const packed = addToPack(player.pack, "vale_fish", 1);
    if (!packed) {
      toast("Pack is full.");
      return false;
    }
    player.pack = packed;
    persist();
    useGameStore.getState().pulse({ pack: player.pack });
    toast("A vale fish. The quay is kind.");
    return true;
  }

  function restInn() {
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    player.sitting = true;
    persist();
    useGameStore.getState().pulse({ hp: player.hp, mp: player.mp, overlay: "playing" });
    toast(useGameStore.getState().talkNpc?.rest ?? "Rested. No coin. The kettle ticks.");
    return true;
  }

  function turnIn() {
    const npc = useGameStore.getState().talkNpc;
    if (!npc) return false;
    const job = jobNeed(npc.role);
    if (!job) return false;
    const have = player.pack.find((s) => s.item === job.item)?.qty ?? 0;
    if (have < job.qty) {
      toast(`Bring ${job.qty}. You have ${have}.`);
      return false;
    }
    const next = takeFromPack(player.pack, job.item, job.qty);
    if (!next) return false;
    player.pack = next;
    player.gold += job.pay;
    persist();
    useGameStore.getState().pulse({ pack: player.pack, gold: player.gold, overlay: "playing" });
    toast(`${npc.name} pays ${formatCoins(job.pay)}. Easy work.`);
    return true;
  }

  function enterDungeon() {
    const s = settlement(player.locationId);
    const spec = dungeonFor(s.id);
    world = generateDungeon(s.seed, s.id);
    player.x = world.townX + 28;
    player.y = world.townY + 36;
    player.walkTarget = null;
    player.target = null;
    player.lockOn = false;
    player.pendingCast = null;
    for (const e of enemies) e.alive = false;
    for (const b of bolts) b.alive = false;
    const name = useGameStore.getState().playerName || "Walker";
    net.enter(`${player.locationId}d`, name);
    spawnBoss();
    toast(`${spec.name}. ${spec.blurb}`);
  }

  function leaveDungeon() {
    const id = player.locationId;
    loadLocation(id);
    const ruin = world.props.find((p) => p.kind === "ruin");
    if (ruin) {
      player.x = ruin.x - 36;
      player.y = ruin.y - 8;
    }
    toast("Daylight. The climb remains.");
  }

  function openShop(id: ShopId) {
    useGameStore.getState().pulse({ shopId: id, overlay: "shop" });
  }

  function buy(item: ItemId) {
    const def = ITEMS[item];
    const shop = SHOPS[useGameStore.getState().shopId ?? "hides"];
    if (!shop.stock.includes(item)) {
      toast(`${shop.title} does not keep that.`);
      return false;
    }
    if (player.gold < def.value) {
      toast("Not enough coin.");
      return false;
    }
    const packed = addToPack(player.pack, item, 1);
    if (!packed) {
      toast("Pack is full.");
      return false;
    }
    player.gold -= def.value;
    player.pack = packed;
    persist();
    useGameStore.getState().pulse({ gold: player.gold, pack: player.pack });
    toast(`Bought ${def.name}.`);
    return true;
  }

  function sell(item: ItemId) {
    const shopId = useGameStore.getState().shopId ?? "hides";
    if (!shopBuys(shopId, item)) {
      toast(`${SHOPS[shopId].title} will not take that.`);
      return false;
    }
    const next = takeFromPack(player.pack, item, 1);
    if (!next) {
      toast("You do not have that.");
      return false;
    }
    player.pack = next;
    player.gold += sellPrice(item);
    persist();
    useGameStore.getState().pulse({ gold: player.gold, pack: player.pack });
    toast(`Sold ${ITEMS[item]?.name ?? "it"}.`);
    return true;
  }

  function stashItem(item: ItemId) {
    const moved = stashInVault(player.vault, player.pack, item);
    if (!moved) {
      toast("The vault will not take that.");
      return false;
    }
    player.vault = moved.vault;
    player.pack = moved.pack;
    persist();
    useGameStore.getState().pulse({ vault: player.vault, pack: player.pack });
    toast(`Stashed ${ITEMS[item]?.name ?? "it"}.`);
    return true;
  }

  function takeVaultSlot(slot: number) {
    const moved = takeFromVault(player.vault, player.pack, slot);
    if (!moved) {
      toast("Pack is full.");
      return false;
    }
    player.vault = moved.vault;
    player.pack = moved.pack;
    persist();
    useGameStore.getState().pulse({ vault: player.vault, pack: player.pack });
    return true;
  }

  function depositCoin(amount: number) {
    const n = amount <= 0 ? player.gold : Math.min(player.gold, Math.floor(amount));
    if (n <= 0) {
      toast("Nothing in the purse.");
      return false;
    }
    player.gold -= n;
    player.vaultCopper += n;
    persist();
    useGameStore.getState().pulse({ gold: player.gold, vaultCopper: player.vaultCopper });
    toast(`Deposited ${formatCoins(n)}.`);
    return true;
  }

  function withdrawCoin(amount: number) {
    const n = amount <= 0 ? player.vaultCopper : Math.min(player.vaultCopper, Math.floor(amount));
    if (n <= 0) {
      toast("The vault is empty.");
      return false;
    }
    player.vaultCopper -= n;
    player.gold += n;
    persist();
    useGameStore.getState().pulse({ gold: player.gold, vaultCopper: player.vaultCopper });
    toast(`Withdrew ${formatCoins(n)}.`);
    return true;
  }

  function useItem(item: ItemId) {
    const def = ITEMS[item];
    if (!def) return false;
    const food = (def.eatHp ?? 0) > 0 || (def.eatMp ?? 0) > 0;
    if (item !== "health_potion" && item !== "mana_potion" && !food) return false;
    const next = takeFromPack(player.pack, item, 1);
    if (!next) return false;
    player.pack = next;
    if (item === "health_potion") player.hp = Math.min(player.maxHp, player.hp + 42);
    else if (item === "mana_potion") player.mp = Math.min(player.maxMp, player.mp + 50);
    else {
      if (def.eatHp) player.hp = Math.min(player.maxHp, player.hp + def.eatHp);
      if (def.eatMp) player.mp = Math.min(player.maxMp, player.mp + def.eatMp);
    }
    persist();
    useGameStore.getState().pulse({ gold: player.gold, pack: player.pack, hp: player.hp, mp: player.mp });
    toast(food ? `You eat ${def.name}.` : item === "health_potion" ? "The draught knits you." : "The weave returns.");
    return true;
  }

  function equip(id: ItemId) {
    const def = ITEMS[id];
    if (!def || def.kind !== "gear" || !def.slot) return false;
    const why = canWear(def, player.level, player.skills);
    if (why) {
      toast(why);
      return false;
    }
    const taken = takeFromPack(player.pack, id, 1);
    if (!taken) return false;
    const prev = player.worn[def.slot];
    let nextPack = taken;
    if (prev) {
      const back = addToPack(nextPack, prev, 1);
      if (!back) {
        toast("Pack is full.");
        return false;
      }
      nextPack = back;
    }
    player.pack = nextPack;
    player.worn = { ...player.worn, [def.slot]: id };
    applyClass(player.classId, false);
    persist();
    useGameStore.getState().pulse({ pack: player.pack, worn: player.worn, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp });
    toast(`Equipped ${def.name}.`);
    return true;
  }

  function unequip(slot: EquipSlot) {
    const id = player.worn[slot];
    if (!id) return false;
    const packed = addToPack(player.pack, id, 1);
    if (!packed) {
      toast("Pack is full.");
      return false;
    }
    player.pack = packed;
    const next = { ...player.worn };
    delete next[slot];
    player.worn = next;
    applyClass(player.classId, false);
    persist();
    useGameStore.getState().pulse({ pack: player.pack, worn: player.worn, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp });
    toast(`Removed ${ITEMS[id]?.name ?? "gear"}.`);
    return true;
  }

  function placeAtFountain() {
    player.x = world.townX;
    player.y = world.townY + 120;
    player.walkTarget = null;
    player.target = null;
    player.lockOn = false;
    player.pendingCast = null;
    player.cds = [0, 0, 0, 0];
    player.iframes = 1.2;
    player.buffArmor = 0;
    player.shield = 0;
    player.hot = 0;
    for (const e of enemies) e.alive = false;
    for (const b of bolts) b.alive = false;
  }

  function startRun(id: ClassId, name: string, keep?: { level: number; xp: number; score: number; skills?: SkillSet; gold?: number; pack?: InvStack[]; worn?: Loadout; vaultCopper?: number; vault?: Vault; locationId?: string }) {
    training = null;
    trainAcc = 0;
    bumpIdle();
    const c = CLASSES[id];
    player.level = keep?.level ?? 1;
    player.xp = keep?.xp ?? 0;
    player.score = keep?.score ?? 0;
    player.lives = 3;
    player.skills = sanitizeSkills(id, keep?.skills);
    player.gold = keep?.gold ?? 25;
    player.pack = (keep?.pack ?? []).map((s) => ({ ...s }));
    player.worn = sanitizeWorn(keep?.worn);
    player.vaultCopper = Math.max(0, keep?.vaultCopper ?? 0);
    player.vault = keep?.vault ? keep.vault.map((s) => (s ? { ...s } : null)) : emptyVault();
    applyClass(id);
    loadLocation(keep?.locationId ?? START_ID);
    useGameStore.getState().pulse({
      playerName: name,
      classId: id,
      screen: "playing",
      overlay: "playing",
      level: player.level,
      score: player.score,
      gold: player.gold,
      pack: player.pack,
      worn: player.worn,
      vaultCopper: player.vaultCopper,
      vault: player.vault,
      locationId: player.locationId,
    });
    Sfx.unlockAudio();
    Sfx.startMusic();
    toast(keep?.level && keep.level > 1 ? `${c.epithet}. Level ${player.level}.` : `${c.vow} The fountain mends you. A cairn west marks a first hunt.`);
  }

  function startThreeHour() {
    const keep = threeHourKeep();
    startRun("warrior", "Holt", keep);
    const cairn = world.props.find((p) => p.kind === "cairn" && p.label === "Copsebarrow Mounds");
    if (cairn) {
      player.x = cairn.x + 48;
      player.y = cairn.y + 28;
    }
    toast("Three hours in. Copsebarrow Mounds. The wights still sit.");
  }

  function retryRun() {
    player.lives = 3;
    applyClass(player.classId);
    placeAtFountain();
    persist();
    useGameStore.getState().pulse({
      screen: "playing",
      overlay: "playing",
      lives: 3,
    });
    Sfx.unlockAudio();
    Sfx.startMusic();
    toast("Walk again. The climb remains.");
  }

  function toast(msg: string) {
    useGameStore.getState().pulse({ toast: msg });
    toastT = 2.4;
  }

  function vocation() {
    return VOCATION[player.classId];
  }

  function trainFight(n = 1) {
    const v = vocation();
    if (addTries(player.skills.fight, n, v.fightRate, v.fightStart, "fight")) {
      toast(`${v.fightName} advanced to ${player.skills.fight.level}.`);
      persist();
    }
  }

  function trainMagic(mana: number) {
    const v = vocation();
    if (addTries(player.skills.magic, Math.max(1, mana), v.magicRate, v.magicStart, "magic")) {
      toast(`Magic Level advanced to ${player.skills.magic.level}.`);
      persist();
    }
  }

  function trainShield() {
    const v = vocation();
    if (addTries(player.skills.shielding, 1, v.shieldRate, v.shieldStart, "shielding")) {
      toast(`Shielding advanced to ${player.skills.shielding.level}.`);
      persist();
    }
  }

  function fightDamage() {
    const c = CLASSES[player.classId];
    const g = bonuses();
    const v = vocation();
    const power = v.fightKind === "distance" ? g.distance : g.attack;
    return rollFightHit(c.attack + power, player.skills.fight.level, player.level);
  }

  function spellDamage(factor = 1) {
    return rollSpellHit(player.level, player.skills.magic.level, factor);
  }

  function puff(x: number, y: number, c: string, n = 8, spd = 40) {
    for (let i = 0; i < n; i++) {
      const p = puffs.find((q) => !q.alive);
      if (!p) return;
      const a = Math.random() * Math.PI * 2;
      const s = spd * (0.4 + Math.random());
      p.alive = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * s;
      p.vy = Math.sin(a) * s;
      p.ttl = p.max = 0.35 + Math.random() * 0.3;
      p.c = c;
      p.s = 2 + Math.random() * 3;
    }
  }

  function floatText(x: number, y: number, text: string, c: string) {
    const f = floats.find((q) => !q.alive);
    if (!f) return;
    f.alive = true;
    f.x = x;
    f.y = y;
    f.ttl = 0.9;
    f.max = 0.9;
    f.text = text;
    f.c = c;
  }

  function dmgPlayer(amt: number) {
    if (player.iframes > 0 || player.shield > 0) return;
    const c = CLASSES[player.classId];
    const g = bonuses();
    const mit = Math.max(1, amt - (c.armor + g.armor + shieldBonus(player.skills.shielding.level) + (player.buffArmor > 0 ? 8 : 0)) * 0.35);
    player.hp -= mit;
    player.flash = 0.12;
    player.iframes = 0.35;
    trauma = Math.min(1, trauma + 0.35);
    hitstop = 0.05;
    Sfx.sfxHit();
    trainShield();
    floatText(player.x, player.y - 28, `${Math.floor(mit)}`, "#e8b4b0");
    if (!lowHpTold && player.hp / player.maxHp < 0.28) {
      lowHpTold = true;
      toast("The fountain would take you.");
    }
    if (player.hp <= 0) die();
  }

  function die() {
    scatterCorpse();
    player.lives -= 1;
    Sfx.sfxDeath();
    puff(player.x, player.y, "#9a4a45", 18, 80);
    const lostXp = applyDeathPenalty();
    persist();
    if (player.lives <= 0) {
      useGameStore.getState().recordScore();
      useGameStore.getState().setScreen("gameover");
      toast(`The hunt ends. −${lostXp} xp. Coin and gear stay two hours.`);
      return;
    }
    player.x = world.townX;
    player.y = world.townY + 120;
    applyClass(player.classId, true);
    player.iframes = 2.2;
    player.target = null;
    player.lockOn = false;
    player.pendingCast = null;
    player.lockOn = false;
    player.pendingCast = null;
    player.walkTarget = null;
    toast(`Fallen. −${lostXp} xp, 3% skill. Coin on the ground. ${player.lives} ${player.lives === 1 ? "life" : "lives"} remain.`);
  }

  const DROP_TTL = 2 * 60 * 60 * 1000;

  function dropId() {
    return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }

  function addDropProp(d: GroundDrop) {
    if (world.props.some((p) => p.loot?.id === d.id)) return;
    const gold = d.gold > 0;
    world.props.push({
      kind: "drop",
      x: d.x,
      y: d.y,
      r: 14,
      solid: false,
      label: gold ? formatCoins(d.gold) : ITEMS[d.item ?? ""]?.name ?? "Gear",
      loot: { id: d.id, item: d.item ?? undefined, qty: d.qty, gold: d.gold, expires: d.expires },
    });
  }

  function addDropFromNet(msg: { id: string; x: number; y: number; item?: string; qty?: number; gold?: number; expires: number }) {
    addDropProp({
      id: msg.id,
      locationId: player.locationId,
      x: msg.x,
      y: msg.y,
      item: msg.item ?? null,
      qty: msg.qty ?? 1,
      gold: msg.gold ?? 0,
      expires: msg.expires,
    });
  }

  function publishDrop(d: GroundDrop) {
    addDropProp(d);
    void postGroundLoot({ data: d }).catch(() => {});
  }

  function scatterCorpse() {
    const expires = Date.now() + DROP_TTL;
    const loc = player.locationId;
    let n = 0;
    const ring = (i: number) => {
      const a = i * 1.2;
      return { x: player.x + Math.cos(a) * (18 + i * 10), y: player.y + Math.sin(a) * (18 + i * 10) };
    };
    if (player.gold > 0) {
      const p = ring(n++);
      publishDrop({ id: dropId(), locationId: loc, x: p.x, y: p.y, item: null, qty: 1, gold: player.gold, expires });
      player.gold = 0;
    }
    const next: Loadout = { ...player.worn };
    for (const slot of SLOT_ORDER) {
      const id = next[slot];
      if (!id) continue;
      if (Math.random() > 0.1) continue;
      const p = ring(n++);
      publishDrop({ id: dropId(), locationId: loc, x: p.x, y: p.y, item: id, qty: 1, gold: 0, expires });
      delete next[slot];
    }
    player.worn = next;
    applyClass(player.classId, false);
    useGameStore.getState().pulse({ gold: player.gold, worn: player.worn });
  }

  function takeDrop(p: WorldProp) {
    const loot = p.loot;
    if (!loot || loot.expires < Date.now()) {
      world.props = world.props.filter((q) => q !== p);
      return;
    }
    void takeGroundLoot({ data: { id: loot.id } })
      .then((got) => {
        if (!got) {
          world.props = world.props.filter((q) => q.loot?.id !== loot.id);
          toast("Gone.");
          return;
        }
        if (got.item) {
          const packed = addToPack(player.pack, got.item, got.qty ?? 1);
          if (!packed) {
            toast("Pack is full.");
            void postGroundLoot({ data: got }).catch(() => {});
            return;
          }
          player.pack = packed;
        }
        if (got.gold && got.gold > 0) player.gold += got.gold;
        world.props = world.props.filter((q) => q.loot?.id !== loot.id);
        persist();
        useGameStore.getState().pulse({ gold: player.gold, pack: player.pack });
        toast(got.gold ? `You take ${formatCoins(got.gold)}.` : `You take ${ITEMS[got.item ?? ""]?.name ?? "gear"}.`);
      })
      .catch(() => toast("The pile stays."));
  }

  function pullGroundLoot() {
    void listGroundLoot({ data: { locationId: player.locationId } })
      .then((rows) => {
        for (const d of rows) addDropProp(d);
      })
      .catch(() => {});
  }

  function applyDeathPenalty() {
    const lostXp = Math.floor(player.xp * 0.1);
    player.xp = Math.max(0, player.xp - lostXp);
    player.level = levelFromXp(player.xp);
    const v = vocation();
    loseSkillProgress(player.skills.fight, v.fightRate, v.fightStart, "fight");
    loseSkillProgress(player.skills.magic, v.magicRate, v.magicStart, "magic");
    loseSkillProgress(player.skills.shielding, v.shieldRate, v.shieldStart, "shielding");
    applyClass(player.classId, true);
    useGameStore.getState().pulse({
      level: player.level,
      score: player.score,
      lives: player.lives,
      hp: player.hp,
      maxHp: player.maxHp,
      mp: player.mp,
      maxMp: player.maxMp,
    });
    return lostXp;
  }

  function gainXp(n: number) {
    player.xp += n;
    let leveled = false;
    while (player.xp >= totalXpForLevel(player.level + 1) && player.level < 400) {
      player.level += 1;
      leveled = true;
      applyClass(player.classId, true);
    }
    if (leveled) {
      Sfx.sfxLevel();
      puff(player.x, player.y, "#c5c8be", 16, 70);
      toast(`Level ${player.level}. The climb steepens.`);
      persist();
    }
  }

  function spawnBolt(
    x: number,
    y: number,
    ang: number,
    speed: number,
    dmg: number,
    sprite: Bolt["sprite"],
    extra?: Partial<Bolt>,
  ) {
    const b = bolts.find((q) => !q.alive);
    if (!b) return;
    b.alive = true;
    b.x = x;
    b.y = y;
    b.vx = Math.cos(ang) * speed;
    b.vy = Math.sin(ang) * speed;
    b.ttl = 1.4;
    b.dmg = dmg;
    b.r = 8;
    b.sprite = sprite;
    b.aoe = 0;
    b.stun = 0;
    b.slow = 0;
    b.fromPlayer = true;
    Object.assign(b, extra);
  }

  function hurtEnemy(e: Enemy, dmg: number, stun = 0, slow = 0) {
    const dealt = Math.max(1, dmg - e.level * 0.3);
    e.hp -= dealt;
    e.flash = 0.1;
    e.stun = Math.max(e.stun, stun);
    e.slow = Math.max(e.slow, slow);
    e.aggro = true;
    const knock = e.boss ? 8 : 18;
    const kAng = Math.atan2(e.y - player.y, e.x - player.x);
    const km = tryMove(world, e.x, e.y, Math.cos(kAng) * knock, Math.sin(kAng) * knock, e.r);
    e.x = km.x;
    e.y = km.y;
    floatText(e.x, e.y - 24, `${Math.floor(dealt)}`, "#e8e2d4");
    puff(e.x, e.y, "#d8c9a8", 5, 50);
    trauma = Math.min(1, trauma + (e.elite ? 0.2 : 0.12));
    hitstop = Math.max(hitstop, e.boss ? 0.09 : 0.04);
    if (e.hp <= 0) {
      e.alive = false;
      const xp = awardedXp(player.level, e.level, ENEMIES[e.kind].xp + e.level * 4) * (e.boss ? 3 : e.elite ? 2 : 1);
      const sc = (ENEMIES[e.kind].score + e.level * 8) * (e.boss ? 3 : e.elite ? 2 : 1);
      player.score += sc;
      gainXp(xp);
      puff(e.x, e.y, e.boss ? "#c5b070" : "#7a3a36", e.boss ? 22 : 14, 70);
      Sfx.sfxDeath();
      floatText(e.x, e.y - 10, `+${xp} xp`, "#c5c8be");
      if (e.title) toast(e.boss ? `${e.title} falls. The crypt remembers.` : `${e.title} falls.`);
      if (!combatTaught) {
        combatTaught = true;
        toast("Hold Strike. Skills sit around it — keys 1 to 4.");
      }
      const loot = rollLoot(e.kind, e.level + (e.elite ? 8 : 0));
      player.gold += loot.gold;
      floatText(e.x + 12, e.y - 4, `+${loot.gold}g`, "#c5b070");
      for (const d of loot.drops) {
        const packed = addToPack(player.pack, d.item, d.qty);
        if (packed) {
          player.pack = packed;
          const def = ITEMS[d.item];
          toast(def?.rarity ? `${def.name} (${def.rarity}).` : `${def?.name ?? d.item}.`);
        } else toast("Pack is full.");
      }
    }
  }

  function pickKind(distTiles: number): EnemyKind {
    if (world.underground && world.dungeon) return pickFromPack(world.dungeon.pack);
    const ground = groundAt(player.locationId, player.x, player.y, world.townX, world.townY, TILE);
    if (ground) return pickFromPack(ground.pack);
    if (distTiles > 70) return Math.random() < 0.5 ? "drake" : Math.random() < 0.5 ? "shrike" : "orc";
    if (distTiles > 50) return Math.random() < 0.45 ? "orc" : Math.random() < 0.5 ? "wight" : "skeleton";
    if (distTiles > 34) return Math.random() < 0.4 ? "wight" : Math.random() < 0.5 ? "skeleton" : "cinder";
    if (distTiles > 22) return Math.random() < 0.5 ? "wolf" : Math.random() < 0.5 ? "wisp" : "crab";
    return Math.random() < 0.55 ? "goblin" : "wisp";
  }

  function fillEnemy(slot: Enemy, kind: EnemyKind, x: number, y: number, lvl: number, extra?: { title?: string; elite?: boolean; boss?: boolean }) {
    const def = ENEMIES[kind];
    const elite = extra?.elite || extra?.boss || false;
    const scale = extra?.boss ? 2.4 : elite ? 1.55 : 1;
    slot.alive = true;
    slot.kind = kind;
    slot.level = lvl;
    slot.x = x;
    slot.y = y;
    slot.r = def.radius * (extra?.boss ? 1.25 : 1);
    slot.hp = slot.maxHp = Math.floor((def.hp + lvl * 7) * scale);
    slot.cd = extra?.boss ? 0.8 : 0.4;
    slot.aggro = !!extra?.boss;
    slot.flash = 0;
    slot.stun = 0;
    slot.slow = 0;
    slot.facing = 0;
    slot.title = extra?.title;
    slot.elite = elite;
    slot.boss = !!extra?.boss;
  }

  function spawnBoss() {
    if (!world.dungeon) return;
    const cairn = world.props.find((p) => p.kind === "cairn" && p.meta === world.dungeon?.boss.kind);
    const x = cairn?.x ?? world.townX + 400;
    const y = cairn?.y ?? world.townY + 400;
    const slot = enemies.find((e) => !e.alive);
    if (!slot) return;
    const lvl = Math.max(world.dungeon.rec[0], player.level + 2);
    fillEnemy(slot, world.dungeon.boss.kind, x, y, lvl, { title: world.dungeon.boss.name, elite: true, boss: true });
  }

  function spawnEnemy() {
    const slot = enemies.find((e) => !e.alive);
    if (!slot) return;
    let x = 0;
    let y = 0;
    const ground = world.underground ? null : groundAt(player.locationId, player.x, player.y, world.townX, world.townY, TILE);
    if (world.underground && world.floors && world.floors.length) {
      const f = world.floors[(Math.random() * world.floors.length) | 0]!;
      x = f.x;
      y = f.y;
      if (Math.hypot(x - player.x, y - player.y) < 140) return;
    } else if (ground) {
      const gx = world.townX + ground.ox * TILE;
      const gy = world.townY + ground.oy * TILE;
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.random() * ground.radius * TILE * 0.85;
      x = gx + Math.cos(ang) * dist;
      y = gy + Math.sin(ang) * dist;
      if (Math.hypot(x - player.x, y - player.y) < 90) return;
    } else {
      const ang = Math.random() * Math.PI * 2;
      const dist = 380 + Math.random() * 340;
      x = player.x + Math.cos(ang) * dist;
      y = player.y + Math.sin(ang) * dist;
    }
    if (x < 80 || y < 80 || x > MAP_W * TILE - 80 || y > MAP_H * TILE - 80) return;
    if (inTown(world, x, y) || blockedAt(world, x, y, 16)) return;
    const dTiles = Math.hypot(x - world.townX, y - world.townY) / TILE;
    const kind = pickKind(dTiles);
    const rec = ground?.rec ?? world.dungeon?.rec;
    const lvl = rec
      ? rec[0] + ((Math.random() * (rec[1] - rec[0] + 1)) | 0)
      : Math.max(1, Math.floor(dTiles / 5) + (world.underground ? 3 : 0));
    const uniq = ground?.unique;
    const asUnique =
      !!uniq && Math.random() < uniq.p && !enemies.some((e) => e.alive && e.title === uniq.name);
    if (asUnique && uniq) {
      fillEnemy(slot, uniq.kind, x, y, lvl + 4, { title: uniq.name, elite: true });
    } else {
      fillEnemy(slot, kind, x, y, lvl);
    }
  }

  function nearestEnemy(range: number) {
    let best: Enemy | null = null;
    let bestD = range;
    for (const e of enemies) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < bestD) {
        best = e;
        bestD = d;
      }
    }
    return best;
  }

  function acquireRange() {
    return CLASSES[player.classId].attackRange + 170;
  }

  function markTarget(t: Enemy) {
    player.target = t;
    player.lockOn = true;
  }

  function clearTarget() {
    player.target = null;
    player.lockOn = false;
    player.pendingCast = null;
  }

  function reachOf(t: Enemy, extra = 10) {
    return Math.hypot(t.x - player.x, t.y - player.y) <= CLASSES[player.classId].attackRange + extra;
  }

  function basicAttack() {
    const c = CLASSES[player.classId];
    if (player.attackCd > 0) return;
    const t = player.target && player.target.alive ? player.target : nearestEnemy(c.attackRange + 16);
    if (!t) return;
    const d = Math.hypot(t.x - player.x, t.y - player.y);
    if (d > c.attackRange + 10) return;
    player.target = t;
    player.attackCd = attackInterval(c.attackCd, player.skills.fight.level, vocation().fightStart);
    player.facing = Math.atan2(t.x - player.x, -(t.y - player.y));
    player.swingT = 0.16;
    const ang = Math.atan2(t.y - player.y, t.x - player.x);
    const caster = c.id === "mage" || c.id === "healer";
    const dmg = caster ? spellDamage(0.9) : fightDamage();
    trainFight(1);
    if (caster) trainMagic(6);
    if (c.attackRange > 80) {
      const spr = c.id === "mage" ? "fireball" : c.id === "healer" ? "holy" : "arrow";
      spawnBolt(player.x, player.y, ang, 280, dmg, spr);
      Sfx.sfxSpell();
    } else {
      hurtEnemy(t, dmg);
      Sfx.sfxSwing();
    }
  }

  function tickCombat(striking: boolean, steering: boolean) {
    const c = CLASSES[player.classId];
    if (player.pendingCast != null) {
      const i = player.pendingCast;
      const ab = c.abilities[i];
      const t = player.target && player.target.alive ? player.target : nearestEnemy(ab?.range || 80);
      if (!ab || player.cds[i] > 0) player.pendingCast = null;
      else if (ab.kind === "self") {
        cast(i);
        player.pendingCast = null;
      } else if (t && Math.hypot(t.x - player.x, t.y - player.y) <= (ab.range || 56) + 14) {
        player.target = t;
        cast(i);
        player.pendingCast = null;
      } else if (t && t.alive) {
        player.target = t;
        if (!steering) player.walkTarget = { x: t.x, y: t.y };
      } else player.pendingCast = null;
    }

    if (striking) {
      const keep = player.target && player.target.alive && Math.hypot(player.target.x - player.x, player.target.y - player.y) < acquireRange() + 40
        ? player.target
        : nearestEnemy(acquireRange());
      if (keep) player.target = keep;
    }
    const t = player.target && player.target.alive ? player.target : null;
    if (!t) return;
    const want = striking || player.lockOn;
    if (!want) return;
    const d = Math.hypot(t.x - player.x, t.y - player.y);
    if (d > c.attackRange + 10) {
      if (!steering) player.walkTarget = { x: t.x, y: t.y };
      return;
    }
    player.walkTarget = null;
    basicAttack();
  }

  function queueCast(i: number) {
    const c = CLASSES[player.classId];
    const ab = c.abilities[i];
    if (!ab) return;
    if (player.cds[i] > 0) return;
    if (player.mp < ab.mana) {
      toast("Need mana.");
      return;
    }
    const t = player.target && player.target.alive ? player.target : nearestEnemy(Math.max(ab.range, acquireRange()));
    if (ab.kind === "self") {
      cast(i);
      return;
    }
    if (ab.kind === "dash") {
      if (t) player.target = t;
      cast(i);
      return;
    }
    if (!t) {
      toast("No foe close enough.");
      return;
    }
    player.target = t;
    player.lockOn = true;
    if (Math.hypot(t.x - player.x, t.y - player.y) > (ab.range || 50) + 12 && ab.kind !== "aoe") {
      player.walkTarget = { x: t.x, y: t.y };
      player.pendingCast = i;
      toast("Closing in.");
      return;
    }
    if (ab.kind === "aoe" && ab.range > 80 && Math.hypot(t.x - player.x, t.y - player.y) > ab.range + 12) {
      player.walkTarget = { x: t.x, y: t.y };
      player.pendingCast = i;
      toast("Closing in.");
      return;
    }
    cast(i);
  }

  function tapFoe() {
    const { x, y } = input.pointer;
    let hit: Enemy | null = null;
    for (const e of enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.x - x, e.y - y) < e.r + 22) {
        hit = e;
        break;
      }
    }
    if (!hit) return false;
    markTarget(hit);
    destMark = { x: hit.x, y: hit.y, ttl: 0.7 };
    if (!reachOf(hit)) player.walkTarget = { x: hit.x, y: hit.y };
    else basicAttack();
    return true;
  }

  function cast(i: number) {
    const c = CLASSES[player.classId];
    const ab = c.abilities[i];
    if (!ab || player.cds[i] > 0 || player.mp < ab.mana) return;
    const t = player.target && player.target.alive ? player.target : nearestEnemy(ab.range || 80);
    const aimX = t ? t.x : player.x + Math.sin(player.facing) * 40;
    const aimY = t ? t.y : player.y - Math.cos(player.facing) * 40;
    const ang = Math.atan2(aimY - player.y, aimX - player.x);
    const dmg = spellDamage(1.15);
    const cd = spellInterval(ab.cooldown, player.skills.magic.level);

    if (ab.kind === "self") {
      player.mp -= ab.mana;
      player.cds[i] = cd;
      trainMagic(ab.mana);
      if (ab.heal) player.hp = Math.min(player.maxHp, player.hp + rollHeal(player.level, player.skills.magic.level, ab.heal));
      if (ab.id === "rally") player.buffArmor = 8;
      if (ab.id === "aegis") player.shield = 2.2;
      if (ab.id === "sanctuary") player.hot = 6;
      if (ab.id === "meditate") player.mp = Math.min(player.maxMp, player.mp + 28);
      Sfx.sfxHeal();
      puff(player.x, player.y, "#d8e0c8", 12, 40);
      return;
    }
    if (ab.kind === "dash") {
      player.mp -= ab.mana;
      player.cds[i] = cd;
      trainMagic(ab.mana);
      trainFight(1);
      const dist = Math.min(ab.range, 180);
      const nx = player.x + Math.cos(ang) * dist;
      const ny = player.y + Math.sin(ang) * dist;
      const moved = tryMove(world, player.x, player.y, nx - player.x, ny - player.y, player.r);
      player.x = moved.x;
      player.y = moved.y;
      if (t && Math.hypot(t.x - player.x, t.y - player.y) < 56) hurtEnemy(t, dmg * 1.2, 0.4);
      puff(player.x, player.y, "#c5c8be", 10, 60);
      Sfx.sfxSwing();
      return;
    }
    if (ab.kind === "aoe") {
      player.mp -= ab.mana;
      player.cds[i] = cd;
      trainMagic(ab.mana);
      const cx = ab.range > 80 && t ? t.x : player.x;
      const cy = ab.range > 80 && t ? t.y : player.y;
      const rad = ab.aoe ?? 80;
      for (const e of enemies) {
        if (!e.alive) continue;
        if (Math.hypot(e.x - cx, e.y - cy) < rad) hurtEnemy(e, dmg, ab.stun ?? 0, ab.id === "snare" ? 2 : 0);
      }
      if (ab.heal) player.hp = Math.min(player.maxHp, player.hp + rollHeal(player.level, player.skills.magic.level, ab.heal));
      puff(cx, cy, ab.projectile === "fireball" ? "#d07040" : "#c8d0e0", 18, 70);
      Sfx.sfxSpell();
      return;
    }
    if (ab.kind === "ranged") {
      if (!t && ab.range > 0) return;
      player.mp -= ab.mana;
      player.cds[i] = cd;
      trainMagic(ab.mana);
      const spr = ab.projectile ?? "holy";
      if (ab.id === "multi") {
        for (const off of [-0.22, 0, 0.22]) spawnBolt(player.x, player.y, ang + off, 300, dmg * 0.7, spr);
      } else {
        spawnBolt(player.x, player.y, ang, 320, dmg * 1.4, spr, {
          aoe: ab.aoe ?? 0,
          stun: ab.stun ?? 0,
          slow: ab.id === "snare" ? 2.5 : 0,
        });
      }
      Sfx.sfxSpell();
      return;
    }
    if (ab.kind === "melee") {
      if (!t || Math.hypot(t.x - player.x, t.y - player.y) > (ab.range || 50) + 10) {
        if (t) {
          player.target = t;
          player.walkTarget = { x: t.x, y: t.y };
        }
        return;
      }
      player.mp -= ab.mana;
      player.cds[i] = cd;
      trainMagic(ab.mana);
      trainFight(ab.id === "flurry" ? 3 : 1);
      if (ab.id === "flurry") {
        hurtEnemy(t, dmg * 0.55);
        hurtEnemy(t, dmg * 0.55);
        hurtEnemy(t, dmg * 0.7);
      } else hurtEnemy(t, dmg * 1.25, ab.stun ?? 0);
      Sfx.sfxSwing();
    }
  }

  function clickWorld() {
    const store = useGameStore.getState();
    if (store.screen !== "playing") return;
    const { x, y } = input.pointer;
    for (const p of world.props) {
      if (Math.hypot(p.x - x, p.y - y) > p.r + 12) continue;
      if (p.kind === "drop") {
        takeDrop(p);
        return;
      }
      if (p.kind === "herb" && !p.taken) {
        pickHerb(p);
        return;
      }
      if (p.kind === "bench") {
        sitDown();
        return;
      }
      if (p.kind === "ruin") {
        enterDungeon();
        return;
      }
      if (p.kind === "stairs") {
        leaveDungeon();
        return;
      }
      if (p.kind === "shop" || p.kind === "stall" || p.kind === "hides" || p.kind === "magicshop" || p.kind === "armory" || p.kind === "fletcher") {
        const sid = shopIdFromProp(p.kind);
        if (sid) openShop(sid);
        return;
      }
      if (p.kind === "bank") {
        store.setOverlay("bank");
        return;
      }
      if (p.kind === "inn") {
        store.setOverlay("inn");
        return;
      }
      if (p.kind === "mill") {
        store.setOverlay("mill");
        return;
      }
      if (p.kind === "house" || p.kind === "cottage" || p.kind === "hall") {
        store.setOverlay("house");
        return;
      }
      if (p.kind === "cairn") {
        player.walkTarget = { x: p.x, y: p.y };
        destMark = { x: p.x, y: p.y, ttl: 1.6 };
        if (p.label) toast(p.label);
        return;
      }
      if (!world.underground && (p.kind === "dock" || p.kind === "portal")) {
        store.setOverlay("atlas");
        return;
      }
      if (p.kind === "fountain") {
        player.walkTarget = { x: p.x, y: p.y };
        destMark = { x: p.x, y: p.y, ttl: 1.2 };
        toast("The fountain mends you. Stand in it.");
        return;
      }
    }
    for (const n of world.npcs ?? []) {
      if (Math.hypot(n.x - x, n.y - y) < 28) {
        store.pulse({ talkNpc: n, overlay: "talk" });
        return;
      }
    }
    let hit: Enemy | null = null;
    for (const e of enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.x - x, e.y - y) < e.r + 16) {
        hit = e;
        break;
      }
    }
    if (hit) {
      markTarget(hit);
      destMark = { x: hit.x, y: hit.y, ttl: 0.8 };
      if (!reachOf(hit)) player.walkTarget = { x: hit.x, y: hit.y };
      else basicAttack();
    } else {
      clearTarget();
      player.walkTarget = { x, y };
      destMark = { x, y, ttl: 1.35 };
    }
  }

  function update(dt: number) {
    const store = useGameStore.getState();
    Sfx.setVolumes(store.settings.sfx, store.settings.music);
    Sfx.tickMusic(dt);
    animT += dt;
    trauma = Math.max(0, trauma - dt * 1.6);
    if (hitstop > 0) {
      hitstop -= dt;
      return;
    }

    if (store.screen !== "playing") return;

    const pointerClick = input.pointer.justDown && !input.pointer.touch;
    const actions = input.sample();
    const steering = Math.hypot(actions.moveX, actions.moveY) > 0.12;
    if (
      steering ||
      pointerClick ||
      input.pointer.justDown ||
      actions.just.attack ||
      actions.just.interact ||
      actions.just.pause ||
      actions.just.inventory ||
      actions.just.map ||
      actions.just.ability.some(Boolean)
    ) {
      bumpIdle();
    }
    if (actions.just.pause) {
      if (store.chatOpen) {
        store.setChatOpen(false);
        return;
      }
      store.setScreen("paused");
      return;
    }
    if (actions.just.chat && !store.chatOpen) {
      store.setChatOpen(true);
      return;
    }
    if (actions.just.inventory) {
      store.setOverlay(store.overlay === "pack" ? "playing" : "pack");
      Sfx.sfxUi();
      return;
    }
    if (actions.just.map) {
      store.setOverlay(store.overlay === "atlas" ? "playing" : "atlas");
      Sfx.sfxUi();
      return;
    }
    if (store.overlay !== "playing") return;
    net.tick(dt);
    const chatting = store.chatOpen;
    const still = chatting || player.sitting;
    if (pointerClick && !still && !steering) clickWorld();
    else if (input.pointer.justDown && input.pointer.touch && !still && !steering) tapFoe();
    const c = CLASSES[player.classId];
    player.attackCd = Math.max(0, player.attackCd - dt);
    player.iframes = Math.max(0, player.iframes - dt);
    player.flash = Math.max(0, player.flash - dt);
    player.buffArmor = Math.max(0, player.buffArmor - dt);
    player.shield = Math.max(0, player.shield - dt);
    player.hot = Math.max(0, player.hot - dt);
    for (let i = 0; i < 4; i++) player.cds[i] = Math.max(0, player.cds[i] - dt);
    player.mp = Math.min(player.maxMp, player.mp + (5 + player.level * 0.15) * dt);
    if (player.hot > 0) player.hp = Math.min(player.maxHp, player.hp + 6 * dt);
    const nearFountain = Math.hypot(player.x - world.townX, player.y - world.townY) < 56;
    if (nearFountain) player.hp = Math.min(player.maxHp, player.hp + 14 * dt);
    else player.hp = Math.min(player.maxHp, player.hp + (player.sitting ? 8 : 1.2) * dt);
    if (player.sitting) player.mp = Math.min(player.maxMp, player.mp + 10 * dt);

    let mx = still ? 0 : actions.moveX;
    let my = still ? 0 : actions.moveY;
    if (Math.hypot(mx, my) > 0.12) player.walkTarget = null;
    if (player.walkTarget) {
      const dx = player.walkTarget.x - player.x;
      const dy = player.walkTarget.y - player.y;
      const len = Math.hypot(dx, dy);
      if (len < 8) player.walkTarget = null;
      else {
        mx = dx / len;
        my = dy / len;
      }
    }
    const speed = c.speed * (player.slow > 0 ? 0.55 : 1);
    const moved = tryMove(world, player.x, player.y, mx * speed * dt, my * speed * dt, player.r);
    player.vx = (moved.x - player.x) / dt;
    player.vy = (moved.y - player.y) / dt;
    player.x = moved.x;
    player.y = moved.y;
    if (training) {
      if (player.sitting || steering || Math.hypot(player.x - training.x, player.y - training.y) > 58) {
        stopTrain();
      } else {
        player.facing = Math.atan2(training.x - player.x, -(training.y - player.y));
        tickTrain(dt);
      }
    }
    const sp = Math.hypot(player.vx, player.vy);
    if (sp > 8) {
      player.facing = Math.atan2(player.vx, -player.vy);
      player.walkT += dt * 6;
      stepT -= dt;
      if (stepT <= 0) {
        stepT = 0.34;
        puff(player.x, player.y + 8, "rgba(90,80,60,0.55)", 3, 22);
        Sfx.sfxStep();
      }
    }

    if (player.swingT > 0) player.swingT = Math.max(0, player.swingT - dt);

    if (!still) {
      for (let i = 0; i < 4; i++) if (actions.just.ability[i]) queueCast(i);
      if (actions.just.interact) tryInteract();
      tickCombat(!!(actions.attack || attackHeld), steering);
    } else if (player.sitting && actions.just.interact) {
      sitDown();
    }

    for (const prop of world.props) {
      if (prop.kind !== "chest" || prop.taken) continue;
      if (Math.hypot(prop.x - player.x, prop.y - player.y) < 28) {
        prop.taken = true;
        player.score += 80 + player.level * 10;
        player.hp = Math.min(player.maxHp, player.hp + 25);
        Sfx.sfxChest();
        puff(prop.x, prop.y, "#c5b070", 12, 50);
        toast("A cache of the Vale. Health restored.");
      }
    }

    spawnT -= dt;
    const now = Date.now();
    if (world.props.some((p) => p.kind === "drop" && p.loot && p.loot.expires < now)) {
      world.props = world.props.filter((p) => p.kind !== "drop" || (p.loot && p.loot.expires >= now));
    }
    const hunt = world.underground ? null : groundAt(player.locationId, player.x, player.y, world.townX, world.townY, TILE);
    const cap = world.underground
      ? Math.min(28, 12 + player.level)
      : hunt
        ? Math.min(22, 8 + player.level)
        : Math.min(36, 10 + player.level);
    const live = enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0);
    if (spawnT <= 0) {
      spawnT = world.underground ? 0.65 : hunt ? 0.72 : 1.1;
      if (live < cap && !inTown(world, player.x, player.y)) spawnEnemy();
    }

    for (const e of enemies) {
      if (!e.alive) continue;
      e.flash = Math.max(0, e.flash - dt);
      e.stun = Math.max(0, e.stun - dt);
      e.slow = Math.max(0, e.slow - dt);
      e.cd = Math.max(0, e.cd - dt);
      const def = ENEMIES[e.kind];
      const d = Math.hypot(player.x - e.x, player.y - e.y);
      if (d < 220) e.aggro = true;
      if (d > 520) e.aggro = false;
      if (inTown(world, e.x, e.y)) {
        const away = Math.atan2(e.y - world.townY, e.x - world.townX);
        const m = tryMove(world, e.x, e.y, Math.cos(away) * 80 * dt, Math.sin(away) * 80 * dt, e.r);
        e.x = m.x;
        e.y = m.y;
        continue;
      }
      if (e.stun > 0) continue;
      if (e.aggro) {
        let dx = player.x - e.x;
        let dy = player.y - e.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        for (const o of enemies) {
          if (!o.alive || o === e) continue;
          const ox = e.x - o.x;
          const oy = e.y - o.y;
          const od = Math.hypot(ox, oy);
          if (od > 0 && od < 36) {
            dx += (ox / od) * 0.4;
            dy += (oy / od) * 0.4;
          }
        }
        const sl = Math.hypot(dx, dy) || 1;
        const spd = def.speed * (e.slow > 0 ? 0.5 : 1);
        const m = tryMove(world, e.x, e.y, (dx / sl) * spd * dt, (dy / sl) * spd * dt, e.r);
        e.vx = (m.x - e.x) / dt;
        e.vy = (m.y - e.y) / dt;
        e.x = m.x;
        e.y = m.y;
        if (Math.hypot(e.vx, e.vy) > 6) e.facing = Math.atan2(e.vx, -e.vy);
        e.walkT += dt * 5;
        const reach = def.range;
        if (d < reach && e.cd <= 0) {
          e.cd = def.attackCd * (e.boss ? 0.85 : 1);
          const atk = (def.attack + e.level * 0.7) * (e.boss ? 1.55 : e.elite ? 1.22 : 1);
          if (kindRanged(e.kind)) {
            const ang = Math.atan2(player.y - e.y, player.x - e.x);
            const spr = e.kind === "wisp" ? "ice" : e.kind === "shrike" ? "holy" : "fireball";
            spawnBolt(e.x, e.y, ang, 180, atk, spr, { fromPlayer: false, r: 7 });
          } else dmgPlayer(atk);
        }
      }
    }

    for (const b of bolts) {
      if (!b.alive) continue;
      b.ttl -= dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.ttl <= 0 || blockedAt(world, b.x, b.y, 4)) {
        b.alive = false;
        continue;
      }
      if (b.fromPlayer) {
        for (const e of enemies) {
          if (!e.alive) continue;
          if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
            hurtEnemy(e, b.dmg, b.stun, b.slow);
            if (b.aoe > 0) {
              for (const o of enemies) {
                if (!o.alive || o === e) continue;
                if (Math.hypot(o.x - b.x, o.y - b.y) < b.aoe) hurtEnemy(o, b.dmg * 0.6, b.stun * 0.5, b.slow);
              }
            }
            b.alive = false;
            break;
          }
        }
      } else if (Math.hypot(player.x - b.x, player.y - b.y) < player.r + b.r) {
        dmgPlayer(b.dmg);
        b.alive = false;
      }
    }

    const atFountain = Math.hypot(player.x - world.townX, player.y - world.townY) < 42;
    if (!world.underground && (atFountain || player.sitting)) {
      const rate = atFountain ? 38 : 14;
      const before = player.hp;
      player.hp = Math.min(player.maxHp, player.hp + rate * dt);
      player.mp = Math.min(player.maxMp, player.mp + rate * 0.45 * dt);
      if (player.hp / player.maxHp > 0.4) lowHpTold = false;
      fountainHum -= dt;
      if (atFountain && fountainHum <= 0 && player.hp > before + 0.5) {
        fountainHum = 2.2;
        Sfx.sfxFountain();
      }
    }

    const hereHunt = world.underground
      ? null
      : groundAt(player.locationId, player.x, player.y, world.townX, world.townY, TILE);
    if (hereHunt && hereHunt.id !== lastHunt) {
      lastHunt = hereHunt.id;
      const fit = huntFit(player.level, hereHunt.rec);
      const warn =
        fit === "deadly"
          ? " Turn back."
          : fit === "hard"
            ? " They will bite."
            : "";
      toast(`${hereHunt.name}. Rec ${hereHunt.rec[0]}–${hereHunt.rec[1]}. ${hereHunt.blurb}${warn}`);
      Sfx.sfxHuntEnter();
    }
    if (!hereHunt && !world.underground) lastHunt = "";

    for (const e of enemies) {
      if (!e.alive || !e.title) continue;
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < 200 && lastUnique !== e.title) {
        lastUnique = e.title;
        toast(`Something named walks here. ${e.title}.`);
        Sfx.sfxUnique();
        break;
      }
    }

    if (destMark) {
      destMark.ttl -= dt;
      if (destMark.ttl <= 0) destMark = null;
    }

    for (const p of puffs) {
      if (!p.alive) continue;
      p.ttl -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.ttl <= 0) p.alive = false;
    }
    for (const f of floats) {
      if (!f.alive) continue;
      f.ttl -= dt;
      f.y -= 22 * dt;
      if (f.ttl <= 0) f.alive = false;
    }

    if (toastT > 0) {
      toastT -= dt;
      if (toastT <= 0) useGameStore.getState().pulse({ toast: "" });
    }

    const k = 1 - Math.exp(-10 * dt);
    cam.x += (player.x - cam.x) * k;
    cam.y += (player.y - cam.y) * k;

    hudT += dt;
    if (hudT > 0.08) {
      hudT = 0;
      const need = xpToNext(player.level);
      const v = VOCATION[player.classId];
      const sk = player.skills;
      useGameStore.getState().pulse({
        hp: player.hp,
        maxHp: player.maxHp,
        mp: player.mp,
        maxMp: player.maxMp,
        xp: progressInLevel(player.level, player.xp),
        level: player.level,
        xpNeed: need,
        score: player.score,
        lives: player.lives,
        classId: player.classId,
        targetName: player.target && player.target.alive
          ? `${player.target.title ?? ENEMIES[player.target.kind].name}${player.target.elite ? " ★" : ""}`
          : "",
        targetHp: player.target && player.target.alive ? player.target.hp : 0,
        targetMax: player.target && player.target.alive ? player.target.maxHp : 0,
        inReach: !!(player.target && player.target.alive && reachOf(player.target)),
        combatHint:
          !combatTaught && hunt && live > 0 && !(player.target && player.target.alive)
            ? "Hold Strike — or tap a beast."
            : "",
        abilities: CLASSES[player.classId].abilities.map((ab, i) => ({
          id: ab.id,
          name: abilityShort(ab),
          mana: ab.mana,
          ready: player.cds[i] <= 0 ? 1 : Math.max(0, 1 - player.cds[i] / ab.cooldown),
          can: player.mp >= ab.mana && player.cds[i] <= 0,
        })),
        skills: [
          { id: "fight", name: v.fightShort, level: sk.fight.level, progress: skillProgress(sk.fight, v.fightRate, v.fightStart, "fight") },
          { id: "magic", name: "Magic", level: sk.magic.level, progress: skillProgress(sk.magic, v.magicRate, v.magicStart, "magic") },
          { id: "shielding", name: "Shield", level: sk.shielding.level, progress: skillProgress(sk.shielding, v.shieldRate, v.shieldStart, "shielding") },
        ],
        gold: player.gold,
        pack: player.pack,
        worn: player.worn,
        locationId: player.locationId,
        prompt: lifePrompt(),
        huntName: world.underground
          ? world.dungeon?.name ?? "The hollow"
          : groundAt(player.locationId, player.x, player.y, world.townX, world.townY, TILE)?.name ?? "",
        objective: liveObjective({
          underground: !!world.underground,
          dungeonName: world.dungeon?.name,
          bossName: world.dungeon?.boss.name,
          hpRatio: player.maxHp ? player.hp / player.maxHp : 1,
          sitting: player.sitting,
          hunt: world.underground
            ? null
            : groundAt(player.locationId, player.x, player.y, world.townX, world.townY, TILE),
          level: player.level,
          locationId: player.locationId,
          x: player.x,
          y: player.y,
          townX: world.townX,
          townY: world.townY,
        }),
        clock: clockLabel(net.day || animT / 210),
        walkers: net.online(),
        who: [...net.remotes.values()].map((r) => ({
          name: r.name,
          level: r.level,
          className: CLASSES[r.classId].name,
          ping: null,
        })),
      });
    }
    netT += dt;
    if (netT > 1 / 15) {
      netT = 0;
      net.pose({
        n: useGameStore.getState().playerName || "Walker",
        c: player.classId,
        lv: player.level,
        x: player.x,
        y: player.y,
        f: player.facing,
        hp: player.hp,
        mh: player.maxHp,
      });
    }
    saveT += dt;
    if (saveT > 4) {
      saveT = 0;
      persist();
    }
  }

  function kindRanged(k: EnemyKind) {
    return isRangedKind(k);
  }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const vv = window.visualViewport;
    const w = canvas.clientWidth || vv?.width || window.innerWidth;
    const h = canvas.clientHeight || vv?.height || window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
  }

  function worldFromScreen(sx: number, sy: number) {
    const dpr = canvas.width / (canvas.clientWidth || 1);
    const x = sx / dpr;
    const y = sy / dpr;
    return { x: x + cam.x - canvas.clientWidth / 2, y: y + cam.y - canvas.clientHeight / 2 };
  }

  input.setScreenToWorld((sx, sy) => worldFromScreen(sx, sy));

  function render() {
    const dpr = canvas.width / (canvas.clientWidth || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#0c0d0b";
    ctx.fillRect(0, 0, w, h);

    const shake = useGameStore.getState().settings.shake ? trauma * trauma : 0;
    const ox = (Math.random() * 2 - 1) * shake * 10;
    const oy = (Math.random() * 2 - 1) * shake * 10;
    const viewX = cam.x - w / 2 + ox;
    const viewY = cam.y - h / 2 + oy;

    const x0 = Math.max(0, (viewX / TILE) | 0);
    const y0 = Math.max(0, (viewY / TILE) | 0);
    const x1 = Math.min(MAP_W, ((viewX + w) / TILE | 0) + 2);
    const y1 = Math.min(MAP_H, ((viewY + h) / TILE | 0) + 2);

    const ts = sprites?.tileCell ?? 32;
    for (let ty = y0; ty < y1; ty++) {
      for (let tx = x0; tx < x1; tx++) {
        let id = world.tiles[ty * MAP_W + tx];
        if (id === T_WATER || id === T_WATER + 1) {
          id = T_WATER + (((animT * 1.7 + tx * 0.37 + ty * 0.21) | 0) % 2);
        }
        const dx = tx * TILE - viewX;
        const dy = ty * TILE - viewY;
        if (sprites?.tiles) {
          const col = id % 4;
          const row = (id / 4) | 0;
          ctx.drawImage(sprites.tiles, col * ts, row * ts, ts, ts, dx, dy, TILE + 0.6, TILE + 0.6);
        } else {
          const pal = ["#4a5a32", "#516238", "#3f4e2c", "#5a6a3c", "#6a5438", "#5c4a32", "#4e402c", "#726044", "#6a6a68", "#5e5e5c", "#747270", "#4e4e4c", "#2a4a55", "#24505c", "#c2b48a", "#2c3a28"];
          ctx.fillStyle = pal[id] ?? "#3a4a2e";
          ctx.fillRect(dx, dy, TILE + 0.5, TILE + 0.5);
        }
      }
    }
    const hour = useGameStore.getState().clock;
    const wash =
      hour === "Dawn"
        ? "rgba(210,150,90,0.13)"
        : hour === "Morning"
          ? "rgba(210,190,140,0.06)"
          : hour === "Dusk"
            ? "rgba(150,80,45,0.14)"
            : hour === "Evening"
              ? "rgba(40,36,55,0.12)"
              : null;
    if (wash) {
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);
    }

    if (destMark) {
      const mx = destMark.x - viewX;
      const my = destMark.y - viewY;
      const a = Math.min(1, destMark.ttl * 1.4);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = "rgba(232,226,212,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx - 7, my);
      ctx.lineTo(mx + 7, my);
      ctx.moveTo(mx, my - 7);
      ctx.lineTo(mx, my + 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const drawables: { y: number; draw: () => void }[] = [];
    for (const p of world.props) {
      if (p.kind === "chest" && p.taken) continue;
      drawables.push({
        y: p.y,
        draw: () => {
          const sx = p.x - viewX;
          const sy = p.y - viewY;
          const img = sprites?.propImgs[p.kind === "stairs" ? "ruin" : p.kind];
          const sizes: Partial<Record<WorldProp["kind"], [number, number]>> = {
            house: [118, 118],
            cottage: [104, 112],
            hall: [112, 122],
            inn: [126, 128],
            mill: [118, 118],
            bank: [118, 122],
            hides: [128, 112],
            magicshop: [78, 148],
            armory: [128, 118],
            fletcher: [118, 112],
            tree: [72, 80],
            fountain: [86, 86],
            cairn: [52, 58],
            ruin: [78, 78],
            stairs: [56, 56],
            shop: [96, 96],
            stall: [84, 84],
            well: [58, 66],
            lantern: [26, 70],
            barrel: [28, 30],
            crate: [28, 28],
            dock: [64, 52],
            portal: [64, 64],
            bench: [56, 34],
            rock: [36, 32],
            herb: [28, 28],
            chest: [36, 36],
            drop: [28, 24],
            dummy: [52, 88],
            shieldpost: [50, 82],
            manafont: [62, 78],
          };
          if (p.kind === "drop") {
            if (p.loot && p.loot.expires < Date.now()) return;
            ctx.fillStyle = p.loot?.gold ? "#c5b070" : "#7a6a48";
            ctx.beginPath();
            ctx.ellipse(sx, sy + 2, 9, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#e8e2d4";
            ctx.beginPath();
            ctx.ellipse(sx, sy - 2, 6, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            if (p.label) {
              ctx.font = "600 11px Figtree, sans-serif";
              ctx.textAlign = "center";
              ctx.fillStyle = "rgba(232,226,212,0.95)";
              ctx.fillText(p.label, sx, sy + 18);
            }
            return;
          }
          if (p.kind === "chest" && p.taken) return;
          if (p.kind === "herb" && p.taken) return;
          const [pw, ph] = sizes[p.kind] ?? [48, 48];
          drawShadow(ctx, sx, sy, Math.max(8, pw * 0.22));
          if (p.kind === "chest" && sprites?.chest) {
            ctx.drawImage(sprites.chest, sx - 18, sy - 28, 36, 36);
            return;
          }
          if (img && drawImg(ctx, img, sx, sy, pw, ph)) {
            if ((p.kind === "cairn" || p.kind === "dummy" || p.kind === "shieldpost" || p.kind === "manafont") && p.label) {
              ctx.font = "600 11px Figtree, sans-serif";
              ctx.textAlign = "center";
              ctx.fillStyle = "rgba(232,226,212,0.9)";
              ctx.fillText(p.label, sx, sy + 22);
            }
            return;
          }
          if (p.kind === "herb") {
            ctx.fillStyle = "#5a6a48";
            ctx.beginPath();
            ctx.arc(sx, sy, 7, 0, Math.PI * 2);
            ctx.fill();
            return;
          }
          if (p.kind === "bench") {
            ctx.fillStyle = "#4a4638";
            ctx.fillRect(sx - 16, sy - 6, 32, 12);
            return;
          }
          if (p.kind === "cairn") {
            ctx.fillStyle = "#3a3a34";
            ctx.beginPath();
            ctx.moveTo(sx - 10, sy + 6);
            ctx.lineTo(sx, sy - 16);
            ctx.lineTo(sx + 10, sy + 6);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#6a6454";
            ctx.fillRect(sx - 12, sy + 4, 24, 7);
            ctx.fillStyle = "rgba(197,176,112,0.85)";
            ctx.beginPath();
            ctx.arc(sx, sy - 20, 3.5, 0, Math.PI * 2);
            ctx.fill();
            if (p.label) {
              ctx.font = "600 11px Figtree, sans-serif";
              ctx.textAlign = "center";
              ctx.fillStyle = "rgba(232,226,212,0.9)";
              ctx.fillText(p.label, sx, sy + 22);
            }
            return;
          }
          if (p.kind === "shop" || p.kind === "dock" || p.kind === "portal" || p.kind === "ruin" || p.kind === "stairs") {
            if (p.kind === "ruin" || p.kind === "stairs") {
              ctx.fillStyle = "#4a4438";
              ctx.fillRect(sx - 16, sy - 6, 10, 22);
              ctx.fillRect(sx + 6, sy - 6, 10, 22);
              ctx.fillStyle = "#6a5e4a";
              ctx.fillRect(sx - 18, sy - 14, 36, 10);
              ctx.strokeStyle = "rgba(197,176,112,0.55)";
              ctx.lineWidth = 1.5;
              ctx.strokeRect(sx - 18, sy - 14, 36, 28);
              return;
            }
            ctx.fillStyle =
              p.kind === "shop" ? "#8a8468" : p.kind === "dock" ? "#4a6d8a" : "#6a6a88";
            ctx.beginPath();
            ctx.arc(sx, sy, p.kind === "dock" ? 16 : 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(232,226,212,0.55)";
            ctx.lineWidth = 2;
            ctx.stroke();
            return;
          }
          if (sprites?.props) {
            const idx = p.kind === "fountain" ? 0 : p.kind === "tree" ? 1 : p.kind === "rock" ? 2 : 3;
            const col = idx % 2;
            const row = (idx / 2) | 0;
            const size = p.kind === "house" ? 92 : p.kind === "tree" ? 70 : p.kind === "fountain" ? 56 : 40;
            drawSheet(ctx, sprites.props, col, row, sx, sy, size);
          }
        },
      });
    }
    for (const e of enemies) {
      if (!e.alive) continue;
      drawables.push({
        y: e.y,
        draw: () => {
          const sx = e.x - viewX;
          const sy = e.y - viewY;
          drawShadow(ctx, sx, sy, e.boss ? 18 : 12);
          if (player.target === e) {
            ctx.save();
            ctx.strokeStyle = e.elite ? "rgba(197,176,112,0.9)" : "rgba(232,226,212,0.85)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(sx, sy + 12, e.boss ? 22 : 16, e.boss ? 10 : 7, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
          const row = dirRow(e.facing);
          const mapped = row === 1 ? 1 : row === 2 ? 2 : row === 3 ? 3 : 0;
          const sheet = sprites?.enemies[e.kind];
          const cell = mapped % 2;
          const r = (mapped / 2) | 0;
          const size = e.boss ? 86 : e.elite ? 68 : 58;
          drawSheet(ctx, sheet, sheet ? cell : 0, sheet ? r : 0, sx, sy, size, e.flash);
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(sx - 18, sy + 10, 36, 4);
          ctx.fillStyle = e.elite ? "#c5b070" : "#9a4a45";
          ctx.fillRect(sx - 18, sy + 10, 36 * (e.hp / e.maxHp), 4);
          if (e.title || e.elite) {
            ctx.font = "600 11px Figtree, sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#c5b070";
            ctx.fillText(e.title ?? ENEMIES[e.kind].name, sx, sy - (e.boss ? 46 : 36));
          }
        },
      });
    }
    drawables.push({
      y: player.y,
      draw: () => {
        const sx = player.x - viewX;
        const sy = player.y - viewY;
        if (attackHeld || player.lockOn) {
          const reach = CLASSES[player.classId].attackRange;
          ctx.save();
          ctx.strokeStyle = "rgba(232,226,212,0.18)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(sx, sy + 8, reach, reach * 0.62, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        drawShadow(ctx, sx, sy, 13);
        const row = dirRow(player.facing);
        const moving = Math.hypot(player.vx, player.vy) > 12;
        const col = moving ? (player.walkT | 0) % 4 : 0;
        ctx.save();
        if (player.swingT > 0) {
          const s = 1 + player.swingT * 1.1;
          ctx.translate(sx, sy);
          ctx.scale(s, 2 - s);
          ctx.translate(-sx, -sy);
        }
        drawSheet(ctx, sprites?.classes[player.classId], col, row, sx, sy, 64, player.flash);
        ctx.restore();
        if (player.swingT > 0) {
          const fx = Math.sin(player.facing);
          const fy = -Math.cos(player.facing);
          ctx.save();
          ctx.strokeStyle = `rgba(232,226,212,${Math.min(1, player.swingT * 6)})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          const a = Math.atan2(fy, fx);
          ctx.arc(sx + fx * 16, sy + fy * 14, 26, a - 0.95, a + 0.95);
          ctx.stroke();
          ctx.restore();
        }
        if (player.shield > 0) {
          ctx.strokeStyle = "rgba(200,210,230,0.6)";
          ctx.beginPath();
          ctx.arc(sx, sy - 8, 26, 0, Math.PI * 2);
          ctx.stroke();
        }
      },
    });
    for (const r of net.remotes.values()) {
      drawables.push({
        y: r.y,
        draw: () => {
          const sx = r.x - viewX;
          const sy = r.y - viewY;
          const row = dirRow(r.facing);
          const moving = Math.hypot(r.tx - r.x, r.ty - r.y) > 2;
          const col = moving ? (r.walkT | 0) % 4 : 0;
          drawSheet(ctx, sprites?.classes[r.classId], col, row, sx, sy, 64);
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          ctx.fillRect(sx - 16, sy + 8, 32, 4);
          ctx.fillStyle = "#9a4a45";
          ctx.fillRect(sx - 16, sy + 8, 32 * Math.max(0, Math.min(1, r.hp / (r.maxHp || 1))), 4);
          ctx.font = "600 11px Figtree, sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = "#e8e2d4";
          ctx.fillText(`${r.name}  ${r.level}`, sx, sy - 36);
        },
      });
    }
    for (const n of world.npcs ?? []) {
      drawables.push({
        y: n.y,
        draw: () => {
          const sx = n.x - viewX;
          const sy = n.y - viewY;
          drawShadow(ctx, sx, sy, 10);
          const spr = sprites?.npcImgs[n.role];
          if (spr) {
            drawImg(ctx, spr, sx, sy, 44, 58);
          } else {
            ctx.fillStyle = n.hue;
            ctx.beginPath();
            ctx.ellipse(sx, sy - 12, 8, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#2a2c26";
            ctx.beginPath();
            ctx.ellipse(sx, sy + 4, 9, 11, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = n.hue;
            ctx.fillRect(sx - 6, sy - 4, 12, 10);
          }
          ctx.font = "600 11px Figtree, sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = "#e8e2d4";
          ctx.fillText(n.name, sx, sy - 26);
        },
      });
    }
    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.draw();

    for (const b of bolts) {
      if (!b.alive) continue;
      const sx = b.x - viewX;
      const sy = b.y - viewY;
      const frame = ((animT * 8) | 0) % 4;
      const sheet = sprites?.fx[b.sprite];
      if (sheet) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(Math.atan2(b.vy, b.vx));
        drawSheet(ctx, sheet, frame % 2, (frame / 2) | 0, 0, 10, 28);
        ctx.restore();
      } else {
        ctx.fillStyle = "#e8e2d4";
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (const p of puffs) {
      if (!p.alive) continue;
      ctx.globalAlpha = p.ttl / p.max;
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x - viewX, p.y - viewY, p.s, p.s);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = "center";
    for (const f of floats) {
      if (!f.alive) continue;
      const u = f.max ? 1 - f.ttl / f.max : 0;
      const pop = 13 + (1 - u) * 5;
      ctx.globalAlpha = Math.min(1, f.ttl * 2.2);
      ctx.font = `700 ${pop}px Figtree, sans-serif`;
      ctx.fillStyle = f.c;
      ctx.fillText(f.text, f.x - viewX, f.y - viewY);
      ctx.globalAlpha = 1;
    }

    const mm = 118;
    const mx = w - mm - 16;
    const my2 = 16;
    const veil = nightVeil(net.day || animT / 210);
    if (world.underground && world.dungeon) {
      const theme = THEME_LIGHT[world.dungeon.theme];
      const psx = player.x - viewX;
      const psy = player.y - viewY;
      const g = ctx.createRadialGradient(psx, psy - 8, 36, psx, psy - 8, 340);
      g.addColorStop(0, theme.torch);
      g.addColorStop(0.35, "rgba(0,0,0,0)");
      g.addColorStop(1, theme.veil);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = theme.veil;
      ctx.globalAlpha = 0.45;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    } else if (veil > 0.02) {
      ctx.fillStyle = `rgba(10,12,18,${veil})`;
      ctx.fillRect(0, 0, w, h);
    }
    const huntNow = world.underground
      ? null
      : groundAt(player.locationId, player.x, player.y, world.townX, world.townY, TILE);
    if (huntNow) {
      ctx.save();
      ctx.globalAlpha = 0.18 + Math.sin(animT * 2) * 0.04;
      for (let i = 0; i < 6; i++) {
        const fx = huntNow.ox * TILE + world.townX + Math.cos(animT * 0.4 + i * 1.7) * 48;
        const fy = huntNow.oy * TILE + world.townY + Math.sin(animT * 0.5 + i) * 36;
        ctx.fillStyle = "#c5c8be";
        ctx.beginPath();
        ctx.arc(fx - viewX, fy - viewY, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (!world.underground) {
      const near = nearestGround(player.locationId, player.x, player.y, world.townX, world.townY);
      if (near && near.dist > 80) {
        const ang = Math.atan2(near.gy - player.y, near.gx - player.x);
        const cx = w / 2 + Math.cos(ang) * Math.min(w, h) * 0.38;
        const cy = h / 2 + Math.sin(ang) * Math.min(w, h) * 0.38;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ang);
        ctx.fillStyle = "rgba(197,176,112,0.85)";
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-6, 5);
        ctx.lineTo(-6, -5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    const hpRatio = player.maxHp ? player.hp / player.maxHp : 1;
    if (hpRatio < 0.32) {
      const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.min(w, h) * 0.72);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(70,18,16,${(0.32 - hpRatio) * 1.4})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.fillStyle = "rgba(12,13,11,0.72)";
    ctx.fillRect(mx, my2, mm, mm);
    ctx.strokeStyle = "rgba(232,226,212,0.18)";
    ctx.strokeRect(mx, my2, mm, mm);
    const scale = mm / (MAP_W * TILE);
    for (const p of world.props) {
      if (p.kind !== "house" && p.kind !== "fountain" && p.kind !== "cairn" && p.kind !== "ruin") continue;
      ctx.fillStyle = p.kind === "fountain" ? "#c5c8be" : p.kind === "cairn" ? "#c5b070" : p.kind === "ruin" ? "#6a5e4a" : "#6a6a60";
      ctx.fillRect(mx + p.x * scale - 1, my2 + p.y * scale - 1, p.kind === "cairn" ? 4 : 3, p.kind === "cairn" ? 4 : 3);
    }
    ctx.fillStyle = "#9a4a45";
    for (const e of enemies) {
      if (!e.alive) continue;
      ctx.fillRect(mx + e.x * scale, my2 + e.y * scale, 2, 2);
    }
    ctx.fillStyle = "#e8e2d4";
    ctx.fillRect(mx + player.x * scale - 2, my2 + player.y * scale - 2, 4, 4);
    ctx.fillStyle = "#c5c8be";
    for (const r of net.remotes.values()) {
      ctx.fillRect(mx + r.x * scale - 1, my2 + r.y * scale - 1, 3, 3);
    }
  }

  function scenic(dt: number) {
    const store = useGameStore.getState();
    if (store.screen === "playing" || store.screen === "paused") return;
    cam.x = world.townX + Math.cos(animT * 0.12) * 80;
    cam.y = world.townY + Math.sin(animT * 0.1) * 50;
    animT += dt;
  }

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += dt;
    const store = useGameStore.getState();
    idleTick();
    if (store.screen === "paused") {
      render();
      requestAnimationFrame(frame);
      return;
    }
    while (acc >= STEP) {
      if (store.screen === "playing") update(STEP);
      else scenic(STEP);
      acc -= STEP;
    }
    render();
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("scroll", resize);
  window.addEventListener("pointerdown", bumpIdle);
  window.addEventListener("keydown", bumpIdle);
  const onHide = () => {
    if (document.visibilityState === "hidden") persist();
  };
  document.addEventListener("visibilitychange", onHide);
  requestAnimationFrame(frame);

  const probe = {
    getYaw: () => player.facing,
    getSpeed: () => Math.hypot(player.vx, player.vy),
    setKeys: (codes: string[]) => {
      const st = useGameStore.getState();
      if (st.screen !== "playing") startRun(st.classId, st.playerName || "Warden");
      input.setKeys(codes);
    },
    getDebug: () => ({
      screen: useGameStore.getState().screen,
      x: Math.round(player.x),
      y: Math.round(player.y),
      vx: +player.vx.toFixed(2),
      vy: +player.vy.toFixed(2),
      facing: +player.facing.toFixed(2),
      dir: ["down", "left", "right", "up"][dirRow(player.facing)],
      gold: player.gold,
      lives: player.lives,
      held: input.heldCodes(),
    }),
    hurt: (n: number) => dmgPlayer(n),
  };
  window.__controlsTest = probe;

  return {
    destroy() {
      persist();
      leaveRealm();
      running = false;
      input.destroy();
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("scroll", resize);
      window.removeEventListener("pointerdown", bumpIdle);
      window.removeEventListener("keydown", bumpIdle);
      document.removeEventListener("visibilitychange", onHide);
      if (window.__controlsTest === probe) delete window.__controlsTest;
    },
    startRun,
    startThreeHour,
    retryRun,
    persist,
    travelTo,
    buy,
    sell,
    openShop,
    stashItem,
    takeVaultSlot,
    depositCoin,
    withdrawCoin,
    useItem,
    equip,
    unequip,
    say(text: string) {
      net.say(useGameStore.getState().playerName || "Walker", text);
    },
    leaveRealm,
    restInn,
    fish,
    turnIn,
    attack: basicAttack,
    setAttackHold(down: boolean) {
      attackHeld = down;
    },
    cast: queueCast,
    interact: tryInteract,
    togglePause() {
      const st = useGameStore.getState();
      attackHeld = false;
      if (st.screen === "playing") st.setScreen("paused");
      else if (st.screen === "paused") st.setScreen("playing");
    },
    input,
  };
}

export type GameHandle = ReturnType<typeof createGame>;

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys: (codes: string[]) => void;
    };
    __thornvale?: { startRun: (id: ClassId, name: string) => void };
  }
}
