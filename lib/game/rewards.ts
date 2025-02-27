import { CardType, Rarity } from '@prisma/client';
import { SHOP_ITEMS } from './shop';

export interface BattleRewards {
  gold: number;
  experience: number;
  cards: CardReward[];
  consumables: ConsumableReward[];
}

export interface CardReward {
  name: string;
  description: string;
  type: CardType;
  rarity: Rarity;
  energy: number;
  damage?: number;
  block?: number;
  effects?: any[];
}

export interface ConsumableReward {
  name: string;
  description: string;
  type: string; // Changed from ConsumableType to string
  value: number;
  duration?: number;
  quantity: number;
}

// Enhanced reward generation with more variety
export function generateBattleRewards(
  difficulty: 'NORMAL' | 'ELITE' | 'BOSS',
  characterClass: string,
  level: number,
  hasNFT: boolean = false
): BattleRewards {
  const rewards: BattleRewards = {
    gold: 0,
    experience: 0,
    cards: [],
    consumables: [],
  };

  // Base rewards by difficulty
  const baseRewards = {
    NORMAL: { gold: [50, 100], exp: 25, cards: 1, consumables: 1 },
    ELITE: { gold: [100, 200], exp: 50, cards: 2, consumables: 1 },
    BOSS: { gold: [200, 500], exp: 100, cards: 3, consumables: 2 }
  };

  const difficultyData = baseRewards[difficulty];

  // Calculate gold with level scaling and NFT bonus
  const baseGold = Math.floor(
    Math.random() * (difficultyData.gold[1] - difficultyData.gold[0]) + 
    difficultyData.gold[0]
  );
  
  rewards.gold = Math.floor(
    baseGold * 
    (1 + level * 0.1) * 
    (hasNFT ? 1.2 : 1)
  );

  // Calculate experience with level scaling
  rewards.experience = Math.floor(
    difficultyData.exp * 
    (1 + level * 0.1)
  );

  // Generate card rewards
  const cardPool = SHOP_ITEMS.cards.filter(card => {
    // Filter by character class and rarity based on difficulty
    const isCorrectClass = true; // Implement class filtering
    const meetsRarityRequirement = difficulty === 'BOSS' ? 
      card.rarity === 'RARE' || card.rarity === 'EPIC' :
      difficulty === 'ELITE' ?
        card.rarity !== 'COMMON' :
        true;
    
    return isCorrectClass && meetsRarityRequirement;
  });

  // Select random cards from the pool
  const selectedCards = cardPool
    .sort(() => Math.random() - 0.5)
    .slice(0, difficultyData.cards);

  rewards.cards = selectedCards.map(card => ({
    name: card.name,
    description: card.description,
    type: card.cardType as CardType,
    rarity: card.rarity as Rarity,
    energy: 1,
    damage: card.damage,
    block: card.block,
    effects: card.effects
  }));

  // Generate consumable rewards
  const consumablePool = SHOP_ITEMS.consumables;
  const selectedConsumables = consumablePool
    .sort(() => Math.random() - 0.5)
    .slice(0, difficultyData.consumables);

  rewards.consumables = selectedConsumables.map(consumable => ({
    name: consumable.name,
    description: consumable.description,
    type: consumable.consumableType || 'HEALTH_POTION', // Provide default value
    value: consumable.value || 0,
    duration: consumable.duration,
    quantity: 1
  }));

  return rewards;
}