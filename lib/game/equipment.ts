import { EquipmentSlot, Rarity, Effect } from '@prisma/client';

export interface EquipmentTemplate {
  name: string;
  description: string;
  slot: EquipmentSlot;
  rarity: Rarity;
  effects: Effect[];
  requirements?: {
    level?: number;
    class?: string[];
  };
  nftRequired?: boolean;
}

export const EQUIPMENT_TEMPLATES: Record<string, EquipmentTemplate> = {
  // Warrior Equipment
  iron_helmet: {
    name: 'Iron Helmet',
    description: 'A sturdy helmet that provides basic protection.',
    slot: 'HEAD',
    rarity: 'COMMON',
    effects: [
      { type: 'MAX_HP', value: 5, duration: null },
      { type: 'BLOCK', value: 1, duration: null },
    ],
    requirements: {
      level: 1,
      class: ['WARRIOR'],
    },
  },
  plate_armor: {
    name: 'Plate Armor',
    description: 'Heavy armor that greatly increases defense.',
    slot: 'CHEST',
    rarity: 'UNCOMMON',
    effects: [
      { type: 'MAX_HP', value: 10, duration: null },
      { type: 'BLOCK', value: 2, duration: null },
    ],
    requirements: {
      level: 3,
      class: ['WARRIOR'],
    },
  },

  // Mage Equipment
  apprentice_robe: {
    name: 'Apprentice Robe',
    description: 'A basic robe that enhances magical abilities.',
    slot: 'CHEST',
    rarity: 'COMMON',
    effects: [
      { type: 'SPELL_POWER', value: 2, duration: null },
      { type: 'MAX_ENERGY', value: 1, duration: null },
    ],
    requirements: {
      level: 1,
      class: ['MAGE'],
    },
  },
  arcane_focus: {
    name: 'Arcane Focus',
    description: 'Channels magical energy more efficiently.',
    slot: 'ACCESSORY',
    rarity: 'UNCOMMON',
    effects: [
      { type: 'SPELL_POWER', value: 3, duration: null },
      { type: 'CARD_DRAW', value: 1, duration: null },
    ],
    requirements: {
      level: 3,
      class: ['MAGE'],
    },
  },

  // Rogue Equipment
  leather_hood: {
    name: 'Leather Hood',
    description: 'Light headgear that improves agility.',
    slot: 'HEAD',
    rarity: 'COMMON',
    effects: [
      { type: 'DEXTERITY', value: 2, duration: null },
      { type: 'CARD_DRAW', value: 1, duration: null },
    ],
    requirements: {
      level: 1,
      class: ['ROGUE'],
    },
  },
  shadow_cloak: {
    name: 'Shadow Cloak',
    description: 'A dark cloak that enhances stealth abilities.',
    slot: 'CHEST',
    rarity: 'UNCOMMON',
    effects: [
      { type: 'DEXTERITY', value: 3, duration: null },
      { type: 'EVASION', value: 10, duration: null },
    ],
    requirements: {
      level: 3,
      class: ['ROGUE'],
    },
  },

  // NFT Exclusive Equipment
  celestial_crown: {
    name: 'Celestial Crown',
    description: 'A legendary crown with powerful enchantments.',
    slot: 'HEAD',
    rarity: 'LEGENDARY',
    effects: [
      { type: 'MAX_HP', value: 15, duration: null },
      { type: 'MAX_ENERGY', value: 1, duration: null },
      { type: 'CARD_DRAW', value: 1, duration: null },
    ],
    nftRequired: true,
  },
  ethereal_pendant: {
    name: 'Ethereal Pendant',
    description: 'A mystical pendant that enhances all abilities.',
    slot: 'ACCESSORY',
    rarity: 'LEGENDARY',
    effects: [
      { type: 'ALL_STATS', value: 3, duration: null },
      { type: 'GOLD_FIND', value: 25, duration: null },
    ],
    nftRequired: true,
  },
};

export function getEquipmentForLevel(
  level: number,
  characterClass: string,
  hasNft: boolean = false
): EquipmentTemplate[] {
  return Object.values(EQUIPMENT_TEMPLATES).filter((equipment) => {
    // Check level requirement
    if (equipment.requirements?.level && level < equipment.requirements.level) {
      return false;
    }

    // Check class requirement
    if (
      equipment.requirements?.class &&
      !equipment.requirements.class.includes(characterClass)
    ) {
      return false;
    }

    // Check NFT requirement
    if (equipment.nftRequired && !hasNft) {
      return false;
    }

    return true;
  });
}

export function calculateEquipmentEffects(
  equipment: EquipmentTemplate[]
): Effect[] {
  const combinedEffects: Record<string, number> = {};

  equipment.forEach((item) => {
    item.effects.forEach((effect) => {
      combinedEffects[effect.type] =
        (combinedEffects[effect.type] || 0) + effect.value;
    });
  });

  return Object.entries(combinedEffects).map(([type, value]) => ({
    type,
    value,
    duration: null, // Permanent effect
  }));
}
