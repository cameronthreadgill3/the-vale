# What still has to be true

Two lists. First: the Vale on an iPhone Home Screen, running like an app. Second: a starting MMORPG, not a town demo.

Checked items already walk. Unchecked items are the work.

## 1. Home Screen app (web, iPhone)

Safari will not put it on the springboard unless this is all true.

### Install
- [ ] Own web app manifest (not Grok's). `name`, `short_name`, `start_url: /play`, `scope: /`, `display: standalone`, `background_color`, `theme_color`
- [ ] Icons: 180 (Apple), 192, 512. Maskable 512. Vale fountain, not the Grok mark
- [ ] `apple-touch-icon` pointing at our 180
- [ ] `apple-mobile-web-app-capable` + `mobile-web-app-capable`
- [ ] `apple-mobile-web-app-title` = A Story as Old as Time (or Thornvale)
- [ ] `apple-mobile-web-app-status-bar-style` = `black-translucent`
- [ ] Splash `apple-touch-startup-image` for current iPhones (portrait at least)
- [ ] HTTPS on a real host (Vercel / custom domain). Home Screen will not keep a preview URL
- [ ] In-page card: “Share → Add to Home Screen.” iPhone never shows Chrome’s install banner
- [x] Viewport `viewport-fit=cover`, theme-color, `h-dvh`, notch padding
- [x] Thumb stick, Strike, Talk, tappable prompt

### Standalone (once it’s on the springboard)
- [ ] Detect `display-mode: standalone`. Hide Safari-only chrome. Keep House inside the app
- [ ] Open `/play` directly. Deep link from House still works
- [ ] No rubber-band scroll on the canvas. No pinch-zoom
- [ ] Audio unlock on first tap (iOS mutes until a gesture)
- [ ] `navigator.storage.persist()` so iOS doesn’t wipe the roster
- [ ] Service worker: cache sprites, tiles, interiors, fonts. App still boots offline to the title. Hunt needs the net
- [ ] Update toast when a new worker is waiting (“A new Vale. Tap to take it.”)
- [ ] Handle `visualViewport` when the keyboard opens on login (partially done)
- [ ] Landscape: stick and Strike still reachable, or lock portrait in the manifest
- [ ] Test on a real iPhone: Add to Home Screen, kill Safari, launch from the icon, sign in, walk, strike, talk, bank

### Android / desktop while we’re there
- [ ] Same manifest. Android can prompt “Add to Home screen”
- [ ] Maskable icon so the adaptive icon isn’t letterboxed

## 2. Starting MMORPG

A town you can walk with friends is a client. An MMORPG is a world that keeps going when you close the phone.

### Authority
- [ ] Server owns position, HP, inventory, gold, skills, worn, vault
- [x] Presence, names, say, and ground piles go through the realm. Combat still predicts on the client
- [x] Rate limits on heartbeat, loot, chat
- [x] Character names unique on the realm, reserved at create
- [x] Account (email / password). Four slots
- [x] Slot save (local + `walker_slots`). This is a keep, not the world

### Shared world
- [x] One Thornhearth. Everyone sees the same walkers, same piles, same night
- [x] Server clock. Day/night not local
- [x] Ground loot table + 2-hour expire. Take is a server delete
- [ ] Spawn tables. Packs respawn. Elites on a timer
- [ ] Instanced dungeons. The copse is public. The barrow is a party instance
- [ ] Logout: sit 10s in the wild, instant at the fountain. Corpse if you pull the plug in combat

### People
- [x] See other walkers (realm presence)
- [x] Say on the square. Yell / whisper later
- [ ] Friends. Ignore. Party (invite, kick, loot rules)
- [ ] Trade window: both lock, both confirm, server swaps
- [ ] Mail: item + coin, 7-day return
- [ ] Guild later. Do not start here

### Combat & characters
- [x] Six paths. Skills. Combat 1–100. Gear rarities. Death 10% xp / 3% skill / coin drop / 10% gear
- [x] Training posts (dummy, shield, font) at Tibia skill speed. 30-minute idle kick
- [ ] PvP flag. Off in town. On in the wild, or a marked pit
- [ ] Threat / tagging so two walkers don’t both get the wolf
- [ ] Corpse: your name on the pile. You can run back. Others can loot after a delay, or not
- [ ] Bind-on-wear for rare+. Soulbound check on trade/mail/drop
- [ ] Durability or repair as a gold sink

### Economy
- [x] Copper / silver / gold / platinum. Bank 100 boxes. Four shops
- [ ] Shop stock is finite or taxed. Vendor buyback
- [ ] Sinks: repair, travel, inn, unstuck, naming
- [ ] No player auction until trade and mail are honest
- [ ] Gold cap / drop table tuned so plat is rare at 100

### Content a first realm needs
- [x] Town, shops, bank, inn, mill, hall, four counters, NPCs
- [x] Copse hunt, atlas, continents sketched
- [ ] Quest journal. Ten starter tasks. Turn-in that the server trusts
- [ ] Tutorial: walk, talk, kill one goblin, sell an ear, wear a blade, die once
- [ ] Rest / hearth / unstuck
- [ ] Death: graveyard at the fountain (done as respawn). Spirit run later
- [ ] World boss weekly. One. Not ten

### Live ops
- [ ] Realms (one is enough). Queue if full
- [ ] Character delete delay (7 days)
- [ ] GM: kick, mute, restore item, move to fountain
- [ ] Reports from chat and from a corpse
- [ ] Metrics: CCU, deaths, gold minted/sunk, error rate
- [ ] Backups of the realm DB. Restore drill
- [ ] ToS, age gate, privacy. COPPA: no under-13
- [ ] Status page. “Thornhearth is up.”

### Client
- [x] Mobile thumbs
- [ ] Disconnect banner. Rejoin the same square
- [ ] Settings: nameplates, chat fade, reduced motion
- [ ] Patch notes already exist. Keep them honest

Do the Home Screen list first. Then authority + shared loot. Then chat/party/trade. Content after the world is real.
