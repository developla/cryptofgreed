import { CardType, Rarity } from '@prisma/client';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'CARD' | 'CONSUMABLE';
  cardType?: CardType;
  rarity?: Rarity;
  consumableType?: string; // Changed from ConsumableType to string
  quantity?: number;
  value?: number;
  duration?: number;
  damage?: number;
  block?: number;
  effects?: any[];
}

// Enhanced shop items with more variety and special effects
export const SHOP_ITEMS = {
  cards: [
    // Advanced Warrior Cards
    {
      id: 'card_1',
      name: 'Whirlwind Strike',
      description: 'Deal 8 damage to ALL enemies. Apply 1 Weak.',
      type: 'CARD' as const,
      cardType: 'ATTACK' as CardType,
      cost: 180,
      rarity: 'RARE' as Rarity,
      damage: 8,
      effects: [
        { type: 'AOE', value: 1 },
        { type: 'WEAK', value: 1, duration: 2 }
      ],
    },
    {
      id: 'card_2',
      name: 'Defensive Stance',
      description: 'Gain 12 Block. Next turn, gain 6 Block.',
      type: 'CARD' as const,
      cardType: 'SKILL' as CardType,
      cost: 160,
      rarity: 'UNCOMMON' as Rarity,
      block: 12,
      effects: [{ type: 'BLOCK_NEXT_TURN', value: 6 }],
    },
    {
      id: 'card_3',
      name: 'Berserker Form',
      description: 'Gain 2 Strength. Take 15% more damage.',
      type: 'CARD' as const,
      cardType: 'POWER' as CardType,
      cost: 200,
      rarity: 'RARE' as Rarity,
      effects: [
        { type: 'STRENGTH', value: 2 },
        { type: 'VULNERABLE_SELF', value: 15, duration: -1 }
      ],
    },

    // Advanced Mage Cards
    {
      id: 'card_4',
      name: 'Chain Lightning',
      description: 'Deal 7 damage to 3 random enemies. Apply 1 Vulnerable.',
      type: 'CARD' as const,
      cardType: 'ATTACK' as CardType,
      cost: 190,
      rarity: 'RARE' as Rarity,
      damage: 7,
      effects: [
        { type: 'MULTI_TARGET', value: 3 },
        { type: 'VULNERABLE', value: 1, duration: 2 }
      ],
    },
    {
      id: 'card_5',
      name: 'Time Dilation',
      description: 'Draw 2 cards. Your next card costs 0.',
      type: 'CARD' as const,
      cardType: 'SKILL' as CardType,
      cost: 170,
      rarity: 'UNCOMMON' as Rarity,
      effects: [
        { type: 'DRAW', value: 2 },
        { type: 'ZERO_COST_NEXT', value: 1 }
      ],
    },

    // Advanced Rogue Cards
    {
      id: 'card_6',
      name: 'Phantom Strike',
      description: 'Deal 12 damage. If the enemy is Weak, gain 2 Energy.',
      type: 'CARD' as const,
      cardType: 'ATTACK' as CardType,
      cost: 150,
      rarity: 'UNCOMMON' as Rarity,
      damage: 12,
      effects: [{ type: 'CONDITIONAL_ENERGY', value: 2 }],
    },
    {
      id: 'card_7',
      name: 'Preparation',
      description: 'Draw 3 cards. Discard 1 card.',
      type: 'CARD' as const,
      cardType: 'SKILL' as CardType,
      cost: 140,
      rarity: 'UNCOMMON' as Rarity,
      effects: [
        { type: 'DRAW', value: 3 },
        { type: 'DISCARD', value: 1 }
      ],
    }
  ],

  consumables: [
    {
      id: 'consumable_1',
      name: 'Mega Health Potion',
      description: 'Restore 40 HP',
      type: 'CONSUMABLE' as const,
      consumableType: 'HEALTH_POTION',
      cost: 150,
      value: 40,
      quantity: 1,
    },
    {
      id: 'consumable_2',
      name: 'Energy Crystal',
      description: 'Gain 3 Energy this turn',
      type: 'CONSUMABLE' as const,
      consumableType: 'ENERGY_POTION',
      cost: 180,
      value: 3,
      quantity: 1,
    },
    {
      id: 'consumable_3',
      name: 'Battle Elixir',
      description: 'Gain 2 Strength and 2 Dexterity for 2 turns',
      type: 'CONSUMABLE' as const,
      consumableType: 'STRENGTH_POTION',
      cost: 200,
      value: 2,
      duration: 2,
      effects: [
        { type: 'STRENGTH', value: 2 },
        { type: 'DEXTERITY', value: 2 }
      ],
      quantity: 1,
    },
    {
      id: 'consumable_4',
      name: 'Focus Potion',
      description: 'Your next 3 attacks deal 50% more damage',
      type: 'CONSUMABLE' as const,
      consumableType: 'STRENGTH_POTION',
      cost: 160,
      value: 50,
      duration: 3,
      quantity: 1,
    }
  ]
};

// Special event discounts
export function getSpecialDiscounts(characterClass: string): Record<string, number> {
  const discounts: Record<string, number> = {};
  
  // Class-specific discounts
  switch (characterClass) {
    case 'WARRIOR':
      discounts['card_1'] = 20; // 20% off Whirlwind Strike
      discounts['consumable_3'] = 15; // 15% off Battle Elixir
      break;
    case 'MAGE':
      discounts['card_4'] = 20; // 20% off Chain Lightning
      discounts['consumable_4'] = 15; // 15% off Focus Potion
      break;
    case 'ROGUE':
      discounts['card_6'] = 20; // 20% off Phantom Strike
      discounts['consumable_2'] = 15; // 15% off Energy Crystal
      break;
  }

  // Random daily discount (1-2 items)
  const allItems = [...SHOP_ITEMS.cards, ...SHOP_ITEMS.consumables];
  const randomItems = allItems
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 1);

  randomItems.forEach(item => {
    if (!discounts[item.id]) {
      discounts[item.id] = Math.floor(Math.random() * 15) + 10; // 10-25% discount
    }
  });

  return discounts;
}