# A Story as Old as Time

Thornvale — a top-down 2D MMORPG. Enter the Vale.

Play: https://vale-as-old-as-time.vercel.app

Six classes, Tibia-style skills, eight continents, gates, hollows, combat, named folk, shops, and coastal ships.

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

### Controls

- **WASD** or **Arrow keys** — move
- **Space** or **left click** — attack nearest foe in range (hold to auto-swing on cooldown)
- **E** — interact (gates, hollows, folk, shops, ships) — still works when not in a fight prompt
- **M** — continent map (discovered lands)
- **K** — toggle skills panel
- **1–7** — train a skill (sword, axe, club, distance, shielding, fist, magic)
- Click a skill row — train that skill
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
- Hostiles spawn mainly in **hollows** (rats, creepers, wisps); a few **briar mites** on overworld edges — seeded so maps feel stable; never on NPCs/gates
- Simple AI: wander → aggro → chase → melee hit on cooldown
- Floating damage numbers; death respawns at continent spawn / hollow exit with HP restored and a mild gold loss
- Class flavor: Warden/Thornblade melee, Pathfinder bolts, Hearthmage/Verdant magic (Verdant soft heal-on-kill), Hollowborn short-range hybrid

### Classes

Warden, Thornblade, Pathfinder, Hearthmage, Verdant, Hollowborn — each with accent color, starting skill biases, and a primary skill that gains tiny XP while moving.

### Continents

Thornreach (starter), Mistmere, Ashen Marches, Sunken Choir, Embercoil, Pale Wastes, Verdant Spine, Nightglass Coast — linked by gates; hollows are seeded per continent.

### Folk, shops, and ships

- Named NPCs on Thornreach, Mistmere, Sunken Choir, Ashen Marches, and Nightglass Coast
- Shops: Thornreach General Store, Mistmere Pier Market, Choir Cloister Stores — buy/sell with starting gold
- Ships link Mistmere ↔ Sunken Choir ↔ Nightglass Coast with short voyage flavor

### Builds

```bash
npm run build        # Vercel / main site → dist/
npm run build:itch   # itch.io HTML5 pack → dist-itch/
```

## Deploy (Vercel)

`vercel.json` pins **Vite** → `npm run build` → **`dist/`** (not the repo root). The public HTML entry is Vite’s `index.html` → `/src/main.tsx`; do not redeploy a static stub landing.

After merging to `main`, Vercel should serve the React client (class select → Thornreach). If the live site still shows a non-clickable “Enter the Vale” card, force a redeploy with Framework Preset **Vite** and Output Directory **dist**.

## Theme

Background `#0c0d0b`, fonts Cinzel + Figtree.
