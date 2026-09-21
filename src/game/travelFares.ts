/**
 * First Story lite travel fares — Thornreach ↔ Mistmere gates and coastal ships.
 * First visit to an undiscovered land is free (no extra save fields).
 * Other continent gates stay unpaid so Accession exploration is not taxed.
 */

import { getContinent, type ContinentId } from "@/game/continents";

export type TravelKind = "gate" | "ship";

export interface TravelQuote {
  gold: number;
  kind: TravelKind;
  from: ContinentId;
  to: ContinentId;
  /** First visit waived a charged route. */
  firstCrossing: boolean;
}

type PairFare = { a: ContinentId; b: ContinentId; gold: number };

/** Watch fare on the Accession road. */
const GATE_PAIR_FARES: PairFare[] = [
  { a: "thornreach", b: "mistmere", gold: 5 },
];

/** Coastal triangle already wired in folk.ts — scales lightly with the hop. */
const SHIP_PAIR_FARES: PairFare[] = [
  { a: "mistmere", b: "sunken-choir", gold: 6 },
  { a: "sunken-choir", b: "nightglass-coast", gold: 7 },
  { a: "mistmere", b: "nightglass-coast", gold: 8 },
];

function pairGold(table: PairFare[], from: ContinentId, to: ContinentId): number {
  for (const row of table) {
    if ((row.a === from && row.b === to) || (row.a === to && row.b === from)) {
      return row.gold;
    }
  }
  return 0;
}

function quoteRoute(
  kind: TravelKind,
  table: PairFare[],
  from: ContinentId,
  to: ContinentId,
  discovered: ContinentId[],
): TravelQuote {
  const base = pairGold(table, from, to);
  const undiscovered = !discovered.includes(to);
  const firstCrossing = undiscovered && base > 0;
  return {
    gold: firstCrossing ? 0 : base,
    kind,
    from,
    to,
    firstCrossing,
  };
}

export function quoteGateFare(
  from: ContinentId,
  to: ContinentId,
  discovered: ContinentId[],
): TravelQuote {
  return quoteRoute("gate", GATE_PAIR_FARES, from, to, discovered);
}

export function quoteShipFare(
  from: ContinentId,
  to: ContinentId,
  discovered: ContinentId[],
): TravelQuote {
  return quoteRoute("ship", SHIP_PAIR_FARES, from, to, discovered);
}

export function canAffordFare(gold: number, quote: TravelQuote): boolean {
  return quote.gold <= 0 || gold >= quote.gold;
}

export function farePromptSuffix(quote: TravelQuote): string {
  if (quote.gold > 0) return ` — ${quote.gold}g`;
  if (quote.firstCrossing) return " — first crossing";
  return "";
}

/** Dock prompt: range across destinations (first sail may read as 0). */
export function shipDockFareSuffix(
  from: ContinentId,
  destinations: ContinentId[],
  discovered: ContinentId[],
): string {
  const quotes = destinations
    .filter((d) => d !== from)
    .map((d) => quoteShipFare(from, d, discovered));
  if (quotes.length === 0) return "";
  const golds = quotes.map((q) => q.gold);
  const min = Math.min(...golds);
  const max = Math.max(...golds);
  const anyFirst = quotes.some((q) => q.firstCrossing);
  if (max <= 0) return anyFirst ? " — first sail" : "";
  if (min <= 0) return ` — up to ${max}g`;
  if (min === max) return ` — ${min}g`;
  return ` — ${min}–${max}g`;
}

export function fareFailToast(quote: TravelQuote): string {
  const name = getContinent(quote.to).name;
  if (quote.kind === "gate") {
    return `Watch fare ${quote.gold}g — the ${name} gate stays shut. Hunt or gather if the purse is light.`;
  }
  return `Pier fare ${quote.gold}g — you cannot board for ${name}. Sell or hunt, then try again.`;
}

export function farePaidToast(kind: TravelKind, destName: string, gold: number): string {
  if (gold <= 0) {
    return kind === "ship"
      ? `Sailing to ${destName} — first crossing, no fare`
      : `Gate opens onto ${destName} — first crossing, no fare`;
  }
  if (kind === "ship") {
    return `Sailing to ${destName} — ${gold}g pier fare`;
  }
  return `Gate opens onto ${destName} — ${gold}g watch fare`;
}
