/** Shared canon: Thornvale is the First Story. Hollow Reach is a later trial. Do not rewrite Lucas's plot. */

export const VALE_LORE = {
  title: "A Story as Old as Time",
  kicker: "The First Story the System still remembers",
  thesis: [
    "Thornvale is not Hollow Reach. Lucas Mercer walks Realm 7,341,882. The Vale is older.",
    "When the System names a world, it reaches for a pattern it has already run. The oldest named pattern is a square, a fountain, six vocations, and a road that does not forget.",
    "The game is that pattern still walking. The books are what happens when fifty thousand humans are dropped into a later copy.",
  ],
  echoes: [
    {
      vale: "Thornhearth's fountain",
      reach: "Hearth's first camp",
      note: "A place that knits you. No charge. You come back when the copse has had enough.",
    },
    {
      vale: "The six — warrior, archer, mage, healer, paladin, monk",
      reach: "Class initiation (Mana Spearman, Healer Initiate, Explorer)",
      note: "The System used to hand out vocations by name. In Hollow Reach it waits until you earn them. The six of Thornvale are the old names it forgot how to say.",
    },
    {
      vale: "Cairns and hunting grounds",
      reach: "Neutral hunt markers, shared schedules, not ownership",
      note: "A rec level on a cairn is the Vale's way of saying what Grant is still learning to write in rules.",
    },
    {
      vale: "The ruin. Stairs. A named hollow.",
      reach: "Glassroot Depths. The quarry breach. The first dungeon.",
      note: "Every square in the Vale has a hollow. Lucas found the first one the hard way.",
    },
    {
      vale: "Sunken roads, mage-gates, ships",
      reach: "The Sunken Road, Weathered Gateway, unrecognized language",
      note: "The worked stone Lucas maps is the same grammar as Vale cobble. The script is the First Story's. Nobody in Hearth can read it yet.",
    },
    {
      vale: "Glasswaste — ship-only, no gate",
      reach: "Glassroot. The Price of Glass. Broodmother.",
      note: "Glass that drinks. The Vale closed the gate. Hollow Reach left a hole in a quarry.",
    },
    {
      vale: "Death takes ten percent of the climb",
      reach: "Survive. Learn. Progress. Permanent death.",
      note: "The Vale is kinder than the trial and crueller than Earth. You keep the name. You lose the ground.",
    },
  ],
  instruction: [
    "Books, audio, anime, and comics keep Lucas's plot locked. Do not move him to Thornhearth.",
    "When a road, a gate, a class, or a hollow appears, let it taste like the Vale — the First Story showing through the later trial.",
    "Mara Holt's kettle, Rook's watch, Noll's three fish: these folk are the kind of ordinary Hearth is trying to become.",
    "The game stays free. It is the First Story you can walk.",
  ],
};

export const VOCATIONS = [
  {
    id: "warrior",
    name: "Warrior",
    epithet: "Ironfront",
    vow: "Hold the line.",
    vale: "Militia captains of Thornvale. Plate, a kite shield, and a wide cleave.",
    reach: "Grant's Ironbound. Marcus with a chopping spear. The old name waiting in a later trial.",
  },
  {
    id: "archer",
    name: "Archer",
    epithet: "Greenpath",
    vow: "Name the cairn.",
    vale: "Hunters who keep the rec levels honest.",
    reach: "Claire's bow. Tessa Ward. Owen's Ranger. Greenpath wearing a new word.",
  },
  {
    id: "mage",
    name: "Mage",
    epithet: "Ash-tongue",
    vow: "Speak the current.",
    vale: "The old name for mana spoken cleanly.",
    reach: "Lucas feeling a current under the water before anyone will teach him. Mana Spearman is Ash-tongue holding a spear.",
  },
  {
    id: "healer",
    name: "Healer",
    epithet: "Ward of the fountain",
    vow: "The fountain does not charge.",
    vale: "You sit in the square and the water knits you.",
    reach: "Sarah. Megan. Limited Skills. Consequences keep their teeth.",
  },
  {
    id: "paladin",
    name: "Paladin",
    epithet: "Dawn-oath",
    vow: "Stand between.",
    vale: "Oath and shield at the old capitals.",
    reach: "Not handed out on Day 0. Hollow Reach waits until someone earns the word.",
  },
  {
    id: "monk",
    name: "Monk",
    epithet: "Open hand",
    vow: "The body is the first weapon.",
    vale: "No gear. The mill talks to its stones. The walker talks to the body.",
    reach: "Physical Reinforcement. Iterative Insight. A method that does not have to belong to the System.",
  },
] as const;

export const CONTINENTS = [
  { id: "thornvale", name: "Thornvale", blurb: "The first continent. Fountain towns, copse, and a south sea." },
  { id: "saltreach", name: "Saltreach", blurb: "Broken isles and a wide current. Ships live here." },
  { id: "greyfen", name: "Greyfen", blurb: "Reed and black water west of the Vale." },
  { id: "emberfold", name: "Emberfold", blurb: "The southern fire-shelf. Ash, glass, and a mage spire." },
  { id: "highmerrow", name: "Highmerrow", blurb: "The north wall. Stone cities in the wind." },
  { id: "duskwood", name: "Duskwood", blurb: "Old forest. Roads fail; the moon-well still answers." },
  { id: "glasswaste", name: "Glasswaste", blurb: "Sand eats the weave. Only ships cross the hot current. No mage-gate." },
  { id: "wintermere", name: "Wintermere", blurb: "The last ice. A north run from Highmerrow, or a frozen gate." },
] as const;

export const RANKS = [
  { rank: "F", levels: "1–50", note: "Where Hollow Reach still lives. Lucas does not jump this." },
  { rank: "E", levels: "51–150", note: "The Vale's ordinary walkers." },
  { rank: "D", levels: "151–350", note: "Learning Saturation bites. Novelty starts to matter." },
  { rank: "C", levels: "351–450", note: "Insight over repetition." },
  { rank: "B", levels: "451–600", note: "The old capitals remember this." },
  { rank: "A", levels: "601–800", note: "Rare on the cobbles." },
  { rank: "S", levels: "801–1000", note: "The First Story does not explain this." },
] as const;

export const TRACKS = [
  {
    name: "Race",
    note: "Body, soul, affinities. In the Vale you keep the name. In the trial, Race XP comes from meaningful Class and Profession work.",
  },
  {
    name: "Class",
    note: "Combat. The six old vocations. Hollow Reach waits until you earn a word: Mana Spearman, Ranger, Healer Initiate.",
  },
  {
    name: "Profession",
    note: "Craft, discovery, routes. Explorer is a Common path the First Story already walked as Wayfinder.",
  },
];

export const FOLK = [
  { vale: "Mara Holt's kettle", reach: "Sarah's medical tarp. Cooking at the center of Hearth." },
  { vale: "Rook Vale's watch", reach: "Grant's perimeter. Owen on the east shift. Patience missing." },
  { vale: "Noll's three fish", reach: "Lowbank's racks. First Meat. Proof of concept, not a solution." },
  { vale: "The mill that talks to its stones", reach: "Daniel's racks, funnels, accounting. Construction becoming civilization." },
];

export type ChapterEcho = { vale: string; note: string; spoken: string };

export const CHAPTER_ECHOES: Record<string, ChapterEcho> = {
  prologue: {
    vale: "The square with a fountain",
    note: "Before Accession, the System already knew a fountain, six vocations, and a road that does not forget.",
    spoken:
      "The System does not invent worlds. It remembers them. Before Basin Grass there was a square with a fountain in it. Walkers still call that pattern Thornvale. Lucas Mercer will never be told this on Day 0.",
  },
  "b1-c01": {
    vale: "A later clearing",
    note: "Lucas thinks Basin Grass is the beginning. It is a copy with the names sanded off.",
    spoken:
      "The yard blinks. The grass is green and the sky is the wrong color. Realm 7,341,882 is a later trial of an older square. Survive. Learn. Progress. The fountain is not here yet.",
  },
  "b1-c02": {
    vale: "Nettle Copse, rec one to four",
    note: "A cairn would have named the hounds. Hearth is still learning to write rec levels.",
    spoken:
      "Bark Hounds in the grass. Needle Rats in the trees. A Mossback Ape that chooses not to fight. In the Vale a cairn would have named the hunt. Here the lesson is paid in blood.",
  },
  "b1-c03": {
    vale: "Ash-tongue",
    note: "The six old vocations used to be handed out by name. Hollow Reach waits until you feel mana yourself.",
    spoken:
      "A current under the water. Razor Hounds herding toward a pack. Lucas feels mana before anyone will teach him. Ash-tongue, wearing no class yet.",
  },
  "b1-c04": {
    vale: "The six",
    note: "Warrior, Spearman, Mana Initiate — the System reaching for names it used to say cleanly.",
    spoken:
      "Class initiation. Warrior, Spearman, Mana Initiate, Mana Spearman. Rarity is not a scoreboard. The System used to hand out vocations by name. Here it waits.",
  },
  "b1-c05": {
    vale: "Open hand, learning the body",
    note: "Mana Reinforcement is not a switch. The Vale already knew: the body is the first weapon.",
    spoken:
      "Too much mana, too fast. A grazer charge. Parties of eight. Contribution, not last hits. The First Story already ran this lesson on cobbles.",
  },
  "b1-c06": {
    vale: "A cairn that names the herd",
    note: "Don't meet a charge. Redirect. The Vale writes rec levels so you don't have to learn this with a shoulder.",
    spoken:
      "First meat. A funnel, not a wall. Liver and hide. The System counts planning if the planning matters. Hearth begins to eat.",
  },
  "b1-c07": {
    vale: "Thornhearth's square",
    note: "Hearth is what a later trial calls a town. The Vale already had cobbles, a kettle, and a watch.",
    spoken:
      "By the seventh morning the clearing means to stay. Hearth. Ironbound. Freewalkers. Grant wants jobs. Lucas wants contribution. Rook's watch without Rook's patience.",
  },
  "b1-c08": {
    vale: "A mill that talks to its stones",
    note: "Student Without a Teacher. The Vale still has teachers. The trial rewards the ones who don't wait.",
    spoken:
      "A charcoal line on ashwood. Mana Reinforcement as a path, not a shove. Hidden achievement. Iterative Insight, Rare. The method does not have to belong to the System.",
  },
  "b1-c09": {
    vale: "Rec levels on a cairn",
    note: "Relative difficulty. The Vale writes it on stone so you don't have to learn it with a Ridgeclaw.",
    spoken:
      "The longer road. A Ridgeclaw, wounded, Level 5. Circumstance is the other half of a rec level. Tomorrow, a weapon that isn't firewood.",
  },
  "b1-c10": {
    vale: "Channelwood along the mill race",
    note: "The Vale forges arms that last. The trial makes you earn the first one in a lethal instance.",
    spoken:
      "A weapon worth keeping. Kinetic Thrust. An Armament Trial with lethality enabled. Channelwood Spear. The First Story's grain, showing through.",
  },
  "b1-c11": {
    vale: "A hunt marked deadly",
    note: "Stonehide Ravager, Level 9. The Vale would have written rec twelve to twenty-four on a barrow. Hearth sends scouts.",
    spoken:
      "The wrong prey. A Channelwood spear that hides mistakes. A Ravager that does not. Reward is not approval. North stays empty.",
  },
  "b1-c12": {
    vale: "Sunken roads",
    note: "Worked stone. Unrecognized language. The First Story showing through the later trial.",
    spoken:
      "The road beneath. A thigh wound and a western walk. Worked stone older than humanity. The script nobody in Hearth can read.",
  },
  "b1-c13": {
    vale: "The script nobody can read",
    note: "Vale cobble uses the same grammar. A Weathered Gateway. A waystation the forest ate.",
    spoken:
      "What the road remembered. Three vertical lines. A dry conduit basin. Stairs Lucas does not take. Sarah wins from miles away.",
  },
  "b1-c14": {
    vale: "Wayfinder",
    note: "Explorer is a Common path the First Story already walked. Field Record does not invent the map.",
    spoken:
      "The shape of a path. Measuring cords. A route panel. Profession: Explorer. The System recognizing a pattern already there.",
  },
  "b1-c15": {
    vale: "Roads that cost nothing",
    note: "Hearth, Lowbank, Stonefield. The Vale already connected five cities with roads that did not charge.",
    spoken:
      "Lines between fires. Field Record holds only what you walked. Lowbank fish. Stonefield clay. A network of needs, not a king.",
  },
  "b1-c16": {
    vale: "Cairns, not claims",
    note: "A rec level is a schedule. Grant wants marks on trees. The Vale never confused the person who keeps a cairn with the person who owns the copse.",
    spoken:
      "The price of a trail. Ironbound slashes. A Ridgeback Stalker over one carcass. Active hunt areas are schedules, not claims.",
  },
  "b1-c17": {
    vale: "A named hollow under every square",
    note: "Stonefield opens a quarry. Glassroot. The Vale already named its ruins. Hollow Reach finds one with a hammer.",
    spoken:
      "Beneath Shiverstone. A sealed boundary, breached. Glassroot Depths. F-Rank. Active. Nonstandard entry. No resurrection.",
  },
  "b1-c18": {
    vale: "Stairs. A named hollow.",
    note: "Every square in the Vale has a ruin you can walk when you are ready. Lucas walks his on the first honest day.",
    spoken:
      "The first descent. Glassback Skitterers using the roots as a tongue. A three-line arch. Withdrawal is still a kind of winning.",
  },
  "b1-c19": {
    vale: "Death takes a tenth of the climb",
    note: "The Vale lets you keep the name. The trial does not give the body back. Rachel Moore. Permanent.",
    spoken:
      "The cost below. A Broodguard at Level 9. A ledge that falls. Seven names in the Party. The fountain is not here to knit anyone.",
  },
  "b1-c20": {
    vale: "Roads that cost nothing to walk",
    note: "Mana Step is footing and a current. Vale cobble does not charge. The trial makes even a step cost mana.",
    spoken:
      "The space between steps. After the deaths, movement itself becomes a question. The First Story's roads did not ask this much.",
  },
  "b1-c21": {
    vale: "Glasswaste",
    note: "The Vale closed the gate. Hollow Reach left a hole in a quarry. Roots that drink.",
    spoken:
      "The root that drinks. Glass that conducts. The old continent would not take a mage-gate. This copy left the hole open.",
  },
  "b1-c22": {
    vale: "The fountain's knitting",
    note: "A narrow moment. In the Vale you sit in the square. Here you hold a seam with a spear.",
    spoken:
      "The narrow moment. Timing, not power. The Ward of the fountain is a later kindness. This trial has Megan and a closing wound.",
  },
  "b1-c23": {
    vale: "What Glasswaste keeps",
    note: "The Vale would not take a gate. The Depths keep what they take. Rachel's pack remains.",
    spoken:
      "What the roots keep. Bodies vanish into the network. The First Story closed this. The later trial is still learning why.",
  },
  "b1-c24": {
    vale: "Ships between ports",
    note: "Load, current, a hull that remembers. The Vale moves people by ship when a gate will not take them.",
    spoken:
      "The load that moves. Weight and conduction. A spear that carries force the way a ship carries a current.",
  },
  "b1-c25": {
    vale: "The Price of Glass",
    note: "Glass that drinks. The old continent would not take a mage-gate.",
    spoken:
      "The price of glass. Broodmother. Conditioned Glassroot is not wild Glassroot. The Vale knew the difference well enough to close a door.",
  },
  "b1-c26": {
    vale: "Mage-gates at the old capitals",
    note: "Except Glasswaste. What travels is what the First Story already routed.",
    spoken:
      "What travels. Transit, not teleport. Roadclaimant is a later word for a thing the cobbles already understood.",
  },
  "b1-c27": {
    vale: "Eight continents",
    note: "The map gets larger because the First Story already had one. Five cities, fifteen towns, twenty villages on each.",
    spoken:
      "The ground between. Ashwood Basin is not the world. The Vale had eight continents before anyone in Hearth learned the word Identify.",
  },
  "b1-c28": {
    vale: "Ironfront, the reach of a line",
    note: "A spear's geometry is older than Mana Spearman. The Vale taught it as a vocation.",
    spoken:
      "The reach of a spear. Kinetic Thrust at the distance a cairn would have named. Ironfront showing through a later class.",
  },
  "b1-c29": {
    vale: "Where a road refuses a gate",
    note: "Glasswaste. The Sunken Road vanishing into a language nobody can read.",
    spoken:
      "Where the road vanishes. Worked stone ending in forest. The First Story did this on purpose. Hollow Reach has not learned the purpose yet.",
  },
  "b1-c30": {
    vale: "You keep the name. You lose the ground.",
    note: "Death tax in the Vale is a tenth of the climb. In the trial it is the whole person.",
    spoken:
      "The line behind you. People you cannot retrieve. The fountain would have taken you. There is no fountain here.",
  },
  "b1-c31": {
    vale: "The square that still points home",
    note: "A fountain, a mill, a watch. Hearth is trying to become that kind of ordinary.",
    spoken:
      "What still points home. Not Earth. A camp with a fire in the middle. The First Story's square, sanded off, still pointing.",
  },
  "b1-c32": {
    vale: "The measure that holds",
    note: "Rec levels. Contribution. Concordance waiting at the cap. The Vale already ran the numbers.",
    spoken:
      "The measure that holds. Rank F. Independent tracks. The System is a spreadsheet with teeth. Lucas has always known this.",
  },
  "b1-c33": {
    vale: "The distance between a cairn and a name",
    note: "Levels are not the story. The Vale lets you sit when the land has had enough.",
    spoken:
      "The distance between levels. Learning Saturation. Novelty. A later trial that still thinks the number is the point.",
  },
  "b1-c34": {
    vale: "The System remembers; it does not invent",
    note: "An answer shaped like an older square. Lucas will not be told the name.",
    spoken:
      "The shape of an answer. The First Story showing through a Warden, a pike, a road that chooses. Not Thornhearth. The copy, named at last.",
  },
  "b1-c35": {
    vale: "The road that chooses",
    note: "Book One ends. The Vale is still walking. Lucas has not been told the First Story. He has been walking a later copy of it.",
    spoken:
      "The road that chooses. Wayward Warden. The trial's first half closes. Book Two is the kettle. The game remains the square you can still walk.",
  },
  "b2-c01": {
    vale: "A spear that stayed",
    note: "The Vale lets you keep the name. You still lose ground. Channelwood does not repair itself.",
    spoken:
      "A spear that stayed broken. Continuity of armament, not a loot chest. The First Story forges; the trial makes you ask people.",
  },
  "b2-c02": {
    vale: "Eight continents",
    note: "The map gets larger because the First Story already had one.",
    spoken:
      "The map gets larger. Route markers waking. Roadclaimant recognizes; it does not command. The Vale's roads never needed a title.",
  },
  "b2-c03": {
    vale: "What a weapon remembers",
    note: "Channelwood grain. Vale smiths already knew conduction is not the same as a blade that lasts.",
    spoken:
      "What a weapon remembers. Salvage the core. Do not pretend ordinary hide wraps are a miracle. The mill would have told you this.",
  },
  "b2-c04": {
    vale: "West on the old road",
    note: "Sunken roads. A sealed bridge. The Ravager still alive. The First Story showing through.",
    spoken:
      "West on the old road. A checkpoint that recognizes a title and refuses authority. Same grammar as Vale cobble. Nobody can read it yet.",
  },
};

export function echoFor(slug: string) {
  return CHAPTER_ECHOES[slug];
}

export const PROLOGUE = {
  slug: "prologue",
  title: "The First Story",
  access: "free" as const,
  body: `The System does not invent worlds. It remembers them.

Before Accession, before Realm 7,341,882, before fifty thousand humans stood in Basin Grass and learned the word Identify, there was a square with a fountain in it. The fountain mended you if you stood in it. A mill talked to its stones. A watch told new walkers that the ruin could wait. West of the cobbles a cairn named Nettle Copse, rec one to four, wisps among the nettle.

The System called that pattern the First Story. Walkers still call it Thornvale.

It has eight continents. Five cities, fifteen towns, twenty villages on each. Roads that cost nothing. Ships between ports. Mage-gates at the old capitals, except Glasswaste, which would not take a gate. Six vocations keep the cobbles: Ironfront, Greenpath, Ash-tongue, Ward of the fountain, Dawn-oath, Open hand. You hunt until the land has had enough of you, then you sit. Death takes a tenth of the climb and five percent of the skill. You keep the name.

Lucas Mercer will never be told this on Day 0. He will stand in a later clearing, in a later trial, and think the ashwood and the Bark Hounds are the beginning. They are not. They are a copy with the names sanded off.

When he finds a Sunken Road of worked stone and a language nobody knows, that is the First Story showing through. When Grant shouts for a perimeter, that is Rook Vale's watch without Rook's patience. When a Class finally answers, it is one of the six, wearing a new word.

This house keeps both: the Vale you can walk, and the trial you can read.

Book One is free. The game is free. The rest of the story — Book Two, the voices, the episodes, the issues — asks ten a month for the whole house, or five for voices or anime.

The fountain does not charge. The First Story does not either. The later chapters do.`,
};
