import { Enemy } from '@prisma/client';

export interface EnemyTemplate {
  name: string;
  health: number;
  maxHealth: number;
  moves: EnemyMove[];
  level: number;
}

export interface EnemyMove {
  name: string;
  description: string;
  damage?: number;
  block?: number;
  effects?: {
    type: string;
    value: number;
    duration?: number;
  }[];
  weight: number; // Higher weight = more likely to be chosen
}

export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = {
  'Slime': {
    name: 'Slime',
    health: 20,
    maxHealth: 20,
    level: 1,
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
    level: 1,
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
    level: 2,
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