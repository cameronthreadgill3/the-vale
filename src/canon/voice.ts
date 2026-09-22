export const VOICE_RULES = [
  "Male narrator. Close third on Lucas. Does not speak character dialogue.",
  "Distinct male voice per named man. Distinct female voice per named woman.",
  "A separate formal voice for System panes, Identify, and directives.",
  "Unnamed crowd stays extra. Not reused as named cast.",
];

export const VOICES = [
  { id: "narrator", name: "Atlas", role: "Narrator", gender: "male" },
  { id: "system", name: "Kepler", role: "The System", gender: "male" },
  { id: "lucas", name: "Perseus", role: "Lucas Mercer", gender: "male" },
  { id: "owen", name: "Sal", role: "Owen Brooks", gender: "male" },
  { id: "grant", name: "Rex", role: "Grant Hale", gender: "male" },
  { id: "daniel", name: "Lumen", role: "Daniel Cross", gender: "male" },
  { id: "marcus", name: "Rigel", role: "Marcus Reed", gender: "male" },
  { id: "sarah", name: "Aurora", role: "Sarah Bennett", gender: "female" },
  { id: "emily", name: "Liora", role: "Emily Carter", gender: "female" },
  { id: "megan", name: "Celeste", role: "Megan", gender: "female" },
  { id: "priya", name: "Iris", role: "Priya", gender: "female" },
  { id: "tessa", name: "Ursa", role: "Tessa Ward", gender: "female" },
] as const;
