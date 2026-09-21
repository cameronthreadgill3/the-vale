# A Story as Old as Time

Thornvale — a top-down 2D MMORPG. Enter the Vale.

Play: https://vale-as-old-as-time.vercel.app

The System remembers this pattern as the **First Story**. Walkers call it Thornvale. Echo texture from Hollow Reach *The Accession* (ashwood, basin grass, Needle Rat, Bark Hound) — not a retelling of Day 0.

Six classes, Tibia-style skills, eight continents, gates, hollows, combat, named folk, shops, and coastal ships.

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

### Controls

**Desktop / keyboard**

- **WASD** or **Arrow keys** — move
- **Space** or **left click** — attack nearest foe in range (hold to auto-swing on cooldown)
- **E** — interact (gates, hollows, folk, shops, bank, ships) — still works when not in a fight prompt
- **B** — backpack / Premium Backpack
- **M** — continent map (discovered lands)
- **K** — toggle skills panel
- **1–3** — use assigned quick skills (around Attack)
- **4–7** — train remaining skills (or assign from the Skills panel)
- Click a skill row — train that skill

**Mobile / touch** (virtual pads appear on coarse pointers or narrow screens)

- **Joystick** (bottom-left) — drag to move (feeds the same WASD path as keyboard)
- **Attack** (bottom-right, large) — tap or hold for auto-swing
- **Interact** — same as **E** (talk / shop / bank / board / gates / hollows)
- **Skills** / **Map** / **Pack** — toggle panels (also available in the top bar)
- **Tap the canvas** — attack nearest foe in range (same as click)
- Overlays (class select, shop, dialogue, skills, map) use larger tap targets and scroll on small screens
- Page scroll/bounce is disabled while playing (`100dvh`, safe-area insets, `touch-action: none`)
- Camera follows the player on a seeded continent map
- Walk onto a **gold gate** tile to travel, or press **E** nearby
- Walk onto a **hollow** (dark circle) to descend, or press **E** nearby
- Inside a hollow, walk onto the **exit** tile (or **E**) to return
- Approach **named folk** (colored sprites) and press **E** to talk; shopkeepers also open a store
- Approach a **ship dock** (sail marker) on Mistmere, Sunken Choir, or Nightglass Coast and press **E** to voyage
- First visit: **Choose your path** (six Vale classes). Choice, skills, gold, inventory, HP/mana, and world location persist in `localStorage` (`vale-character-v1`).

### Combat

Tibia-flavored, scoped tight:

- **HP** (and **mana** for Hearthmage / Verdant) on the HUD; max HP scales lightly with combat level and shielding
- Attack uses the class’s combat skill (sword / axe / distance / magic / fist); damage scales with that skill + a small roll
- **Shielding** reduces damage taken
- Killing foes grants **combat XP**, **skill XP** on the skill used, and a little **gold**
- Hostiles: **Needle Rat** (Beast Lv.2 F) and **Bark Hound** (Beast Lv.4 F) from Accession texture, plus shade wisps in deeper hollows; sparse briar mites — seeded; never on NPCs/gates
- Simple AI: wander → aggro → chase → melee hit on cooldown
- Floating damage numbers; death respawns at continent spawn (hollows eject) with HP restored
- **Death losses:** about **5% of carried gold** (at least 1g if you hold any) and **10% of carried item quantity** (rounded down). **Banked gold and items never drop.** A toast lists what was lost.
- Class flavor: Warden/Thornblade melee, Pathfinder bolts, Hearthmage/Verdant magic (Verdant soft heal-on-kill), Hollowborn short-range hybrid

### Weight, bank, safe square, Premium Backpack

- Items have **weight**. Default pack is **20 slots / 80 wt**. HUD shows `Pack wt/max · slots`. Buy and withdraw are blocked when overweight or full (toast).
- **Thornreach plaza / fountain** is a safe zone (dashed ring): beasts will not aggro or attack while you or they stand in the square. Fountain still heals at the basin.
- **Cress Vault** (west of the fountain) banks items and gold. Vault contents persist on the character save and are ignored by death loss.
- **Premium Backpack** unlocks **32 slots** and **+50% weight capacity**, stored on the character. **Pack (B)** has a **Demo unlock** that works without Stripe keys. If `VITE_STRIPE_PUBLISHABLE_KEY` + price id are set, Stripe Checkout is an optional path (`POST /api/create-checkout-session`, verify on return).


### First sticky quest — Teeth in the Grass

After class select on Thornreach, Rook flags the ashwood edge: wrong prey. A minimal HUD tracks:

1. **Identify** a Needle Rat (near-field look / Name · Rank pane)
2. Defeat **3 Needle Rats** near Thornhearth / ashwood edge
3. Survive or drive off **1 Bark Hound**

Rewards: modest gold + combat XP + shielding skill XP, with a short Survive · Learn · Progress line. Progress persists in `vale-character-v1`. Early Thornreach fauna is briefly denser while the hunt is active.




### Second sticky quest — Ashwood Watch

After *Teeth in the Grass* completes, Rook starts **Ashwood Watch** on Thornreach (auto-toast, or talk to Rook). Walk the ashwood edge:

1. **Inspect** 3 watch cairns (E) away from the plaza
2. **Identify or clear** 1 Needle Rat or Bark Hound after at least one cairn

Rewards: modest gold + combat XP + shielding skill XP. Yellow wayfinding arrow points at the next cairn, then wrong prey, then Rook. Progress persists with the quest log.

### Third sticky quest — Hollow Watch

After *Ashwood Watch* completes, Rook starts **Hollow Watch**: something wrong under the nearest Thornreach hollow.

1. **Enter** a Thornreach hollow (dark circle on the overworld)
2. **Identify** a Shade Wisp (near-field look / Name · Rank)
3. **Defeat** 2 Shade Wisps deeper in the hollow
4. Return to Rook when the flicker is cleared (complete toast + rewards)

Rewards: ~40g + ~80 combat XP + magic skill XP. Yellow arrow points at the hollow entrance, then wisps, then Rook. First Story Accession texture only — Survive · Learn · Progress.

### Wayfinding (where to go)

New cues so you are never lost on Thornreach:

1. **Quest arrow + HUD line** — Active sticky quests show a yellow edge/on-screen arrow toward the current objective (cairns, hollow entrance, Shade Wisp, Needle Rat, Bark Hound, or Rook) plus a HUD line like `→ Identify Needle Rat · 12 tiles`.
2. **Labeled landmarks + compass** — Larger high-contrast markers; names for folk, **Gate → Continent**, hollow entrance/exit, ship docks, and the plaza **Fountain** within ~8 tiles. Top-center compass (N/E/S/W) with a tiny radar of nearby interactables (gold) and the quest target (bright).
3. **Starter tip + clear prompts** — First 60s on load: soft tip *Talk to Rook (watch) · Bank with Cress · Fountain square is safe*. Nearest interactable prompts read as actions: `Talk · Rook`, `Talk / Bank · Cress Vault`, `Enter hollow`, `Use gate → …`, `Board ship · …`.


### Classes

Warden, Thornblade, Pathfinder, Hearthmage, Verdant, Hollowborn — each with accent color, starting skill biases, and a primary skill that gains tiny XP while moving.

### Continents

Thornreach (starter), Mistmere, Ashen Marches, Sunken Choir, Embercoil, Pale Wastes, Verdant Spine, Nightglass Coast — linked by gates; hollows are seeded per continent.

### Folk, shops, and ships

- Named NPCs on Thornreach (Rook watch-captain, Mara shop, Noll healer, **Cress Vault** banker), Mistmere (Old Reed guide), Sunken Choir, Ashen Marches, and Nightglass Coast — First Story echoes only; no Hollow Reach cast
- Shops: Thornreach General Store, Mistmere Pier Market, Choir Cloister Stores — buy/sell with starting gold (blocked if the pack cannot carry the weight)
- Thornreach vault: deposit/withdraw items and gold with Cress
- Ships link Mistmere ↔ Sunken Choir ↔ Nightglass Coast with short voyage flavor

### Builds

```bash
npm run build        # Vercel / main site → dist/
npm run build:itch   # itch.io HTML5 pack → dist-itch/
```

## Deploy (Vercel)

`vercel.json` pins **Vite** → `npm run build` → **`dist/`** (not the repo root). The public HTML entry is Vite’s `index.html` → `/src/main.tsx`; do not redeploy a static stub landing.

After merging to `main`, Vercel should serve the React client (class select → Thornreach). If the live site still shows a non-clickable “Enter the Vale” card, force a redeploy with Framework Preset **Vite** and Output Directory **dist**.

## Accounts & character slots

Players sign up with **email + password** (and an account display name), then pick one of **four character slots**. Empty slots open the existing class-select flow; filled slots show name / class / level with **Play** and **Delete**. Logout returns to the account gate.

### Auth: Clerk (preferred) + demo fallback

| Env var | Where | Purpose |
|---------|--------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Vite client / Vercel | Clerk publishable key (`pk_…`). Enables live sign-up / sign-in UI. |
| `CLERK_SECRET_KEY` | Vercel server (future `api/*`) | Clerk secret for backend verification. Not required for the metadata MVP. |

Copy `.env.example` → `.env.local` for local dev. On Vercel: Project → Settings → Environment Variables.

**If keys are missing**, the app does **not** crash: it shows a setup banner and runs **demo mode** (accounts + slots stored in `localStorage` only).

**Offline playtests:** **Continue offline (local)** opens **character slots** (local browser storage under the synthetic `offline` account) — it no longer auto-loads a guest save. Create a new path to start on **Thornreach** with **Teeth in the Grass** (Rook toast + quest arrow). An old `vale-character-v1` guest save is migrated into an empty slot; if it was stuck off Thornreach mid-Teeth, it is reset to Thornreach. While playing, **Characters** returns to slots and **Account** returns to the gate. After signing in you can still **Import offline local save into first empty slot**.

### Character storage (pragmatic MVP)

Slot snapshots (compact `ValeCharacter` + quest log) live in:

1. **Clerk** `user.unsafeMetadata.valeCharacterSlots` when Clerk is configured, or
2. **Demo** `localStorage` key `vale-demo-slots:<userId>` when keys are missing.

Active play still uses scoped `localStorage` (`vale-char:<userId>:<slot>` / `vale-quests:<userId>:<slot>`) and writes back into the slot snapshot when you return to **Characters**.

> **Production follow-up:** move slots to **Neon Postgres** (or Vercel KV) behind `api/*` routes with `@clerk/backend`. Clerk metadata is fine for early playtests (few KB per character) but is not a long-term game DB.

### UI flow

1. Boot → Account gate (Sign up / Sign in) unless already signed in  
2. Character slots → 4 cards (Create / Play / Delete)  
3. Play → existing `GameApp` with that slot’s save  
4. **Characters** / **Sign out** chrome returns to slots / gate  

## Theme

Background `#0c0d0b`, fonts Cinzel + Figtree.
