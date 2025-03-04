import { Card } from '../context/types';

// Helper function to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Create a card with default properties
const createCard = (card: Omit<Card, 'id' | 'upgraded'>): Card => {
  return {
    ...card,
    id: generateId(),
    upgraded: false
  };
};

// Starter deck cards
export const starterCards: Card[] = [
  createCard({
    name: 'Strike',
    type: 'attack',
    description: 'Deal 6 damage to the enemy.',
    energyCost: 1,
    value: 6,
    rarity: 'common'
  }),
  createCard({
    name: 'Strike',
    type: 'attack',
    description: 'Deal 6 damage to the enemy.',
    energyCost: 1,
    value: 6,
    rarity: 'common'
  }),
  createCard({
    name: 'Strike',
    type: 'attack',
    description: 'Deal 6 damage to the enemy.',
    energyCost: 1,
    value: 6,
    rarity: 'common'
  }),
  createCard({
    name: 'Defend',
    type: 'defense',
    description: 'Gain 5 block.',
    energyCost: 1,
    value: 5,
    rarity: 'common'
  }),
  createCard({
    name: 'Defend',
    type: 'defense',
    description: 'Gain 5 block.',
    energyCost: 1,
    value: 5,
    rarity: 'common'
  }),
  createCard({
    name: 'Defend',
    type: 'defense',
    description: 'Gain 5 block.',
    energyCost: 1,
    value: 5,
    rarity: 'common'
  }),
  createCard({
    name: 'Quick Strike',
    type: 'attack',
    description: 'Deal 4 damage to the enemy. Costs 0 energy.',
    energyCost: 0,
    value: 4,
    rarity: 'common'
  }),
  createCard({
    name: 'Power Up',
    type: 'buff',
    description: 'Gain 2 strength for 3 turns.',
    energyCost: 1,
    value: 2,
    rarity: 'uncommon'
  }),
  createCard({
    name: 'Heavy Strike',
    type: 'attack',
    description: 'Deal 10 damage to the enemy.',
    energyCost: 2,
    value: 10,
    rarity: 'uncommon'
  }),
  createCard({
    name: 'Guard',
    type: 'defense',
    description: 'Gain 8 block.',
    energyCost: 2,
    value: 8,
    rarity: 'uncommon'
  })
];

// Add the getStarterCards function that was missing
export const getStarterCards = (): Card[] => {
  return starterCards.map(card => ({ 
    ...card, 
    id: generateId(),
    upgraded: false
  }));
};

// Common cards that can be acquired during the game
export const commonCards: Card[] = [
  createCard({
    name: 'Slice',
    type: 'attack',
    description: 'Deal 8 damage to the enemy.',
    energyCost: 1,
    value: 8,
    rarity: 'common'
  }),
  createCard({
    name: 'Bash',
    type: 'attack',
    description: 'Deal 7 damage and apply 1 Vulnerable.',
    energyCost: 1,
    value: 7,
    rarity: 'common'
  }),
  createCard({
    name: 'Quick Block',
    type: 'defense',
    description: 'Gain 7 block.',
    energyCost: 1,
    value: 7,
    rarity: 'common'
  }),
  createCard({
    name: 'Draw Strength',
    type: 'special',
    description: 'Draw 2 cards.',
    energyCost: 1,
    value: 2,
    rarity: 'common'
  })
];

// Uncommon cards
export const uncommonCards: Card[] = [
  createCard({
    name: 'Precision Strike',
    type: 'attack',
    description: 'Deal 12 damage to the enemy.',
    energyCost: 2,
    value: 12,
    rarity: 'uncommon'
  }),
  createCard({
    name: 'Double Strike',
    type: 'attack',
    description: 'Deal 5 damage twice.',
    energyCost: 1,
    value: 5,
    rarity: 'uncommon'
  }),
  createCard({
    name: 'Iron Wall',
    type: 'defense',
    description: 'Gain 12 block.',
    energyCost: 2,
    value: 12,
    rarity: 'uncommon'
  }),
  createCard({
    name: 'Weaken',
    type: 'debuff',
    description: 'Apply 2 Weak to the enemy.',
    energyCost: 1,
    value: 2,
    rarity: 'uncommon'
  })
];

// Rare cards
export const rareCards: Card[] = [
  createCard({
    name: 'Meteor Strike',
    type: 'attack',
    description: 'Deal 20 damage to the enemy.',
    energyCost: 3,
    value: 20,
    rarity: 'rare'
  }),
  createCard({
    name: 'Impenetrable Defense',
    type: 'defense',
    description: 'Gain 20 block.',
    energyCost: 3,
    value: 20,
    rarity: 'rare'
  }),
  createCard({
    name: 'Battle Trance',
    type: 'special',
    description: 'Draw 3 cards and gain 1 energy.',
    energyCost: 0,
    value: 3,
    rarity: 'rare'
  }),
  createCard({
    name: 'Demon Form',
    type: 'buff',
    description: 'At the start of each turn, gain 3 Strength.',
    energyCost: 3,
    value: 3,
    rarity: 'rare'
  })
];

// Function to get a random card based on rarity
export const getRandomCard = (rarity?: 'common' | 'uncommon' | 'rare'): Card => {
  let cardPool: Card[];
  
  if (!rarity) {
    // Determine rarity based on probabilities (70% common, 25% uncommon, 5% rare)
    const roll = Math.random() * 100;
    if (roll < 70) {
      cardPool = commonCards;
    } else if (roll < 95) {
      cardPool = uncommonCards;
    } else {
      cardPool = rareCards;
    }
  } else {
    switch (rarity) {
      case 'common':
        cardPool = commonCards;
        break;
      case 'uncommon':
        cardPool = uncommonCards;
        break;
      case 'rare':
        cardPool = rareCards;
        break;
      default:
        cardPool = commonCards;
    }
  }
  
  // Generate a new ID for the card to ensure it's unique
  const randomIndex = Math.floor(Math.random() * cardPool.length);
  const selectedCard = { 
    ...cardPool[randomIndex], 
    id: generateId(),
    upgraded: false
  };
  
  return selectedCard;
};

// Function to get a set of random cards as rewards
export const getCardRewards = (count: number = 3): Card[] => {
  const rewards: Card[] = [];
  
  for (let i = 0; i < count; i++) {
    rewards.push(getRandomCard());
  }
  
  return rewards;
};

// Function to create a new starter deck
export const createStarterDeck = (): Card[] => {
  return starterCards.map(card => ({ 
    ...card, 
    id: generateId(),
    upgraded: false
  }));
};
