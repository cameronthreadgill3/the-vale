/** Equipped loadout, pack weight, and class starter kits. */

import type { ClassId } from "@/game/classes";
import {
  getItem,
  isEquippable,
  isItemId,
  type EquipSlot,
  type ItemId,
} from "@/game/items";

export interface EquipmentLoadout {
  weapon: ItemId | null;
  armor: ItemId | null;
  shield: ItemId | null;
}

export interface InventoryStack {
  id: ItemId;
  qty: number;
}

export const EQUIP_SLOTS: EquipSlot[] = ["weapon", "armor", "shield"];

export const SLOT_LABEL: Record<EquipSlot, string> = {
  weapon: "Weapon",
  armor: "Armor",
  shield: "Shield",
};

export function emptyEquipment(): EquipmentLoadout {
  return { weapon: null, armor: null, shield: null };
}

export function sanitizeEquipment(raw: unknown): EquipmentLoadout {
  const out = emptyEquipment();
  if (!raw || typeof raw !== "object") return out;
  const o = raw as Record<string, unknown>;
  for (const slot of EQUIP_SLOTS) {
    const id = o[slot];
    if (!isItemId(id)) continue;
    const item = getItem(id);
    if (item.slot !== slot) continue;
    out[slot] = id;
  }
  if (out.weapon) {
    const w = getItem(out.weapon);
    if (w.twoHand) out.shield = null;
  }
  return out;
}

export function equipmentAttack(equipment: EquipmentLoadout): {
  attack: number;
  skill: ItemId | null;
  twoHand: boolean;
  weaponSkill: ReturnType<typeof getItem>["weaponSkill"];
} {
  if (!equipment.weapon) {
    return { attack: 0, skill: null, twoHand: false, weaponSkill: undefined };
  }
  const item = getItem(equipment.weapon);
  return {
    attack: item.attack ?? 0,
    skill: equipment.weapon,
    twoHand: Boolean(item.twoHand),
    weaponSkill: item.weaponSkill,
  };
}

export function equipmentDefense(equipment: EquipmentLoadout): number {
  let def = 0;
  if (equipment.armor) def += getItem(equipment.armor).defense ?? 0;
  if (equipment.shield) def += getItem(equipment.shield).defense ?? 0;
  return def;
}

/** First-path kits: worn on create so the ashwood edge is walkable. */
export function starterKit(classId: ClassId): {
  equipment: EquipmentLoadout;
  inventory: InventoryStack[];
} {
  const inventory: InventoryStack[] = [{ id: "trail-rations", qty: 2 }];
  switch (classId) {
    case "warden":
      return {
        equipment: {
          weapon: "fledgling-sword",
          armor: "fledgling-vest",
          shield: "basin-buckler",
        },
        inventory,
      };
    case "thornblade":
      return {
        equipment: {
          weapon: "ashwood-hatchet",
          armor: "fledgling-vest",
          shield: null,
        },
        inventory,
      };
    case "pathfinder":
      return {
        equipment: {
          weapon: "reed-bow",
          armor: "fledgling-vest",
          shield: null,
        },
        inventory,
      };
    case "hearthmage":
      return {
        equipment: {
          weapon: "hearth-rod",
          armor: "fledgling-vest",
          shield: null,
        },
        inventory,
      };
    case "verdant":
      return {
        equipment: {
          weapon: "thornleaf-wand",
          armor: "fledgling-vest",
          shield: null,
        },
        inventory,
      };
    case "hollowborn":
      return {
        equipment: {
          weapon: "cloth-wraps",
          armor: "fledgling-vest",
          shield: null,
        },
        inventory,
      };
  }
}

export function canEquipItem(id: ItemId, slot: EquipSlot): boolean {
  const item = getItem(id);
  return isEquippable(item) && item.slot === slot;
}
