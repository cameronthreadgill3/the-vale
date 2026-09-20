# A Story as Old as Time

Thornvale — a top-down 2D MMORPG. Enter the Vale.

Play: https://vale-as-old-as-time.vercel.app

Six classes, Tibia-style skills, eight continents, gates, and procedural hollows.

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

### Controls

- **WASD** or **Arrow keys** — move
- **E** — interact (gates, hollow entrances, hollow exits)
- **M** — continent map (discovered lands)
- **K** — toggle skills panel
- **1–7** — train a skill (sword, axe, club, distance, shielding, fist, magic)
- Click a skill row — train that skill
- Camera follows the player on a seeded continent map
- Walk onto a **gold gate** tile to travel, or press **E** nearby
- Walk onto a **hollow** (dark circle) to descend, or press **E** nearby
- Inside a hollow, walk onto the **exit** tile (or **E**) to return
- First visit: **Choose your path** (six Vale classes). Choice, skills, and world location persist in `localStorage` (`vale-character-v1`).

### Classes

Warden, Thornblade, Pathfinder, Hearthmage, Verdant, Hollowborn — each with accent color, starting skill biases, and a primary skill that gains tiny XP while moving.

### Continents

Thornreach (starter), Mistmere, Ashen Marches, Sunken Choir, Embercoil, Pale Wastes, Verdant Spine, Nightglass Coast — linked by gates; hollows are seeded per continent.

### Builds

```bash
npm run build        # Vercel / main site → dist/
npm run build:itch   # itch.io HTML5 pack → dist-itch/
```

## Theme

Background `#0c0d0b`, fonts Cinzel + Figtree.
