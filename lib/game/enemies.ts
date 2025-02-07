import { Enemy, Move, Effect } from '@prisma/client';

export interface EnemyTemplate {
  name: string;
  health: number;
  maxHealth: number;
  moves: EnemyMove[];
  level: number;
  experienceReward: number;
  goldReward: { min: number; max: number };
}

export interface EnemyMove {
  name: string;
  description: string;
  damage?: number;
  block?: number;
  effects?: Effect[];
  weight: number;
}

// Scale enemy stats based on level
export function scaleEnemy(enemy: Enemy & { moves: Move[] }, targetLevel: number): EnemyTemplate {
  const levelDiff = targetLevel - enemy.level;
  const scalingFactor = 1 + (levelDiff * 0.2); // 20% increase per level

  return {
    name: enemy.name,
    health: Math.round(enemy.health * scalingFactor),
    maxHealth: Math.round(enemy.maxHealth * scalingFactor),
    level: targetLevel,
    experienceReward: Math.round(enemy.experienceReward * scalingFactor),
    goldReward: {
      min: Math.round(enemy.goldRewardMin * scalingFactor),
      max: Math.round(enemy.goldRewardMax * scalingFactor)
    },
    moves: enemy.moves.map(move => ({
      name: move.name,
      description: move.description,
      damage: move.damage ?? undefined,
      block: move.block ?? undefined,
      effects: move.effects,
      weight: move.weight
    }))
  };
}

export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = {
  'Slime': {
    name: 'Slime',
    health: 20,
    maxHealth: 20,
    level: 1,
    experienceReward: 10,
    goldReward: { min: 5, max: 15 },
    moves: [
      {
        name: 'Tackle',
        description: 'Deals 6 damage',
        damage: 6,
        weight: 70
      },
      {
        name: 'Split',
        description: 'Gains 5 block',
        block: 5,
        weight: 30
      }
    ]
  },
  'Goblin': {
    name: 'Goblin',
    health: 25,
    maxHealth: 25,
    level: 2,
    experienceReward: 15,
    goldReward: { min: 10, max: 20 },
    moves: [
      {
        name: 'Slash',
        description: 'Deals 8 damage',
        damage: 8,
        weight: 60
      },
      {
        name: 'Defend',
        description: 'Gains 6 block',
        block: 6,
        weight: 40
      }
    ]
  },
  'Dark Mage': {
    name: 'Dark Mage',
    health: 30,
    maxHealth: 30,
    level: 3,
    experienceReward: 20,
    goldReward: { min: 15, max: 25 },
    moves: [
      {
        name: 'Shadow Bolt',
        description: 'Deals 10 damage',
        damage: 10,
        weight: 50
      },
      {
        name: 'Dark Shield',
        description: 'Gains 8 block',
        block: 8,
        weight: 30
      },
      {
        name: 'Curse',
        description: 'Applies 2 Weak',
        effects: [{ type: 'WEAK', value: 2, duration: 2 }],
        weight: 20
      }
    ]
  }
};