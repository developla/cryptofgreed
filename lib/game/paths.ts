import { CharacterClass, EquipmentSlot, Rarity } from '@prisma/client';

export type PathType = 'BATTLE' | 'MERCHANT' | 'EVENT' | 'REST' | 'TREASURE';
export type Difficulty = 'NORMAL' | 'ELITE' | 'BOSS';

export interface PathOption {
  id: string;
  type: PathType;
  title: string;
  description: string;
  difficulty?: Difficulty;
  rewards?: Reward[];
  requirements?: PathRequirement[];
}

interface Reward {
  type: 'GOLD' | 'EXPERIENCE' | 'CARD' | 'EQUIPMENT' | 'ITEM';
  amount?: number;
  item?: any;
  chance: number;
}

interface PathRequirement {
  type: 'LEVEL' | 'GOLD' | 'ITEM' | 'CLASS' | 'NFT';
  value: any;
  description: string;
}

export const generatePathOptions = (
  characterLevel: number,
  characterClass: CharacterClass,
  currentHealth: number,
  maxHealth: number,
  nftOwned: boolean = false
): PathOption[] => {
  const options: PathOption[] = [];
  const healthPercentage = (currentHealth / maxHealth) * 100;

  // Normal Battle
  options.push({
    id: 'battle_normal',
    type: 'BATTLE',
    title: 'Enemy Encounter',
    description: 'Face a normal enemy in combat.',
    difficulty: 'NORMAL',
    rewards: [
      { type: 'GOLD', amount: 50, chance: 1 },
      { type: 'EXPERIENCE', amount: 25, chance: 1 },
      { type: 'CARD', chance: 0.3 },
      { type: 'EQUIPMENT', chance: 0.1 },
    ],
  });

  // Elite Battle (Level 3+)
  if (characterLevel >= 3) {
    options.push({
      id: 'battle_elite',
      type: 'BATTLE',
      title: 'Elite Enemy',
      description: 'A powerful foe with unique abilities and better rewards.',
      difficulty: 'ELITE',
      rewards: [
        { type: 'GOLD', amount: 100, chance: 1 },
        { type: 'EXPERIENCE', amount: 50, chance: 1 },
        { type: 'CARD', chance: 0.5 },
        { type: 'EQUIPMENT', chance: 0.3 },
      ],
      requirements: [
        {
          type: 'LEVEL',
          value: 3,
          description: 'Requires level 3 or higher',
        },
      ],
    });
  }

  // Boss Battle (Every 5 levels)
  if (characterLevel % 5 === 0) {
    options.push({
      id: 'battle_boss',
      type: 'BATTLE',
      title: 'Boss Battle',
      description: 'A challenging boss fight with exceptional rewards.',
      difficulty: 'BOSS',
      rewards: [
        { type: 'GOLD', amount: 250, chance: 1 },
        { type: 'EXPERIENCE', amount: 100, chance: 1 },
        { type: 'CARD', chance: 1 },
        { type: 'EQUIPMENT', chance: 0.7 },
      ],
      requirements: [
        {
          type: 'LEVEL',
          value: characterLevel,
          description: `Requires level ${characterLevel}`,
        },
      ],
    });
  }

  // Rest Site (More likely when health is low)
  if (healthPercentage < 70 || Math.random() < 0.3) {
    options.push({
      id: 'rest_site',
      type: 'REST',
      title: 'Rest Site',
      description:
        healthPercentage < 50
          ? 'A safe haven to recover your strength.'
          : 'Rest to heal or upgrade your cards.',
      rewards: [
        { type: 'CARD', chance: 0.2 }, // Chance to upgrade a card
      ],
    });
  }

  // Merchant (30% chance, guaranteed if NFT owned)
  if (Math.random() < 0.3 || nftOwned) {
    options.push({
      id: 'merchant',
      type: 'MERCHANT',
      title: nftOwned ? 'Premium Merchant' : 'Merchant',
      description: nftOwned
        ? 'A special merchant with rare items and better prices.'
        : 'Buy cards, potions, and equipment.',
    });
  }

  // Treasure Room (20% chance, 40% if NFT owned)
  if (Math.random() < (nftOwned ? 0.4 : 0.2)) {
    options.push({
      id: 'treasure',
      type: 'TREASURE',
      title: nftOwned ? 'Rich Treasure Room' : 'Treasure Room',
      description: nftOwned
        ? 'A vault filled with valuable treasures and rare items.'
        : 'Find valuable loot and rare items.',
      rewards: [
        { type: 'GOLD', amount: nftOwned ? 200 : 100, chance: 1 },
        { type: 'EQUIPMENT', chance: nftOwned ? 0.5 : 0.3 },
      ],
    });
  }

  // Mystery Event (25% chance)
  if (Math.random() < 0.25) {
    options.push({
      id: 'event',
      type: 'EVENT',
      title: 'Mystery Event',
      description: 'An unexpected encounter with unknown consequences.',
      rewards: [
        { type: 'GOLD', chance: 0.5 },
        { type: 'EXPERIENCE', chance: 0.5 },
        { type: 'CARD', chance: 0.3 },
        { type: 'EQUIPMENT', chance: 0.2 },
      ],
    });
  }

  // Class-specific paths (10% chance)
  if (Math.random() < 0.1) {
    switch (characterClass) {
      case 'WARRIOR':
        options.push({
          id: 'warrior_trial',
          type: 'EVENT',
          title: "Warrior's Trial",
          description: 'A special challenge for warriors to test their might.',
          requirements: [
            {
              type: 'CLASS',
              value: 'WARRIOR',
              description: 'Requires Warrior class',
            },
          ],
          rewards: [
            { type: 'EQUIPMENT', chance: 0.8 },
            { type: 'CARD', chance: 0.6 },
          ],
        });
        break;
      case 'MAGE':
        options.push({
          id: 'arcane_study',
          type: 'EVENT',
          title: 'Arcane Study',
          description: 'An opportunity to learn powerful new spells.',
          requirements: [
            {
              type: 'CLASS',
              value: 'MAGE',
              description: 'Requires Mage class',
            },
          ],
          rewards: [
            { type: 'CARD', chance: 0.8 },
            { type: 'EXPERIENCE', amount: 50, chance: 1 },
          ],
        });
        break;
      case 'ROGUE':
        options.push({
          id: 'heist',
          type: 'EVENT',
          title: 'Heist Opportunity',
          description: 'A chance for skilled rogues to acquire valuable loot.',
          requirements: [
            {
              type: 'CLASS',
              value: 'ROGUE',
              description: 'Requires Rogue class',
            },
          ],
          rewards: [
            { type: 'GOLD', amount: 300, chance: 0.7 },
            { type: 'EQUIPMENT', chance: 0.5 },
          ],
        });
        break;
    }
  }

  // NFT-exclusive paths
  if (nftOwned) {
    options.push({
      id: 'premium_event',
      type: 'EVENT',
      title: 'Premium Event',
      description:
        'An exclusive event for NFT holders with guaranteed rewards.',
      requirements: [
        {
          type: 'NFT',
          value: true,
          description: 'Requires Game NFT',
        },
      ],
      rewards: [
        { type: 'GOLD', amount: 500, chance: 1 },
        { type: 'EQUIPMENT', chance: 1 },
        { type: 'CARD', chance: 1 },
      ],
    });
  }

  // Shuffle and return 3 random options
  return options.sort(() => Math.random() - 0.5).slice(0, 3);
};
