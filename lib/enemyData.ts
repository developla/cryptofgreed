
import { Enemy } from '../context/GameContext';

// Helper function to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Basic enemies
export const basicEnemies: Enemy[] = [
  {
    id: generateId(),
    name: 'Slime',
    maxHealth: 15,
    currentHealth: 15,
    damage: 5,
    intent: 'attack',
    intentValue: 5
  },
  {
    id: generateId(),
    name: 'Goblin',
    maxHealth: 18,
    currentHealth: 18,
    damage: 6,
    intent: 'attack',
    intentValue: 6
  },
  {
    id: generateId(),
    name: 'Bat',
    maxHealth: 12,
    currentHealth: 12,
    damage: 4,
    intent: 'attack',
    intentValue: 4
  },
  {
    id: generateId(),
    name: 'Skeleton',
    maxHealth: 20,
    currentHealth: 20,
    damage: 7,
    intent: 'attack',
    intentValue: 7
  }
];

// Elite enemies
export const eliteEnemies: Enemy[] = [
  {
    id: generateId(),
    name: 'Orc Captain',
    maxHealth: 35,
    currentHealth: 35,
    damage: 10,
    intent: 'attack',
    intentValue: 10
  },
  {
    id: generateId(),
    name: 'Dark Mage',
    maxHealth: 30,
    currentHealth: 30,
    damage: 12,
    intent: 'attack',
    intentValue: 12
  },
  {
    id: generateId(),
    name: 'Armored Golem',
    maxHealth: 40,
    currentHealth: 40,
    damage: 8,
    intent: 'attack',
    intentValue: 8
  }
];

// Boss enemies
export const bossEnemies: Enemy[] = [
  {
    id: generateId(),
    name: 'Dragon',
    maxHealth: 80,
    currentHealth: 80,
    damage: 15,
    intent: 'attack',
    intentValue: 15
  },
  {
    id: generateId(),
    name: 'Demon Lord',
    maxHealth: 75,
    currentHealth: 75,
    damage: 18,
    intent: 'attack',
    intentValue: 18
  },
  {
    id: generateId(),
    name: 'Ancient Lich',
    maxHealth: 70,
    currentHealth: 70,
    damage: 20,
    intent: 'attack',
    intentValue: 20
  }
];

// Function to determine enemy intent for next turn
export const getNextIntent = (enemy: Enemy): Enemy => {
  const newEnemy = { ...enemy };
  
  // Simple logic: mostly attack, occasionally defend or buff
  const roll = Math.random() * 100;
  
  if (roll < 70) {
    // 70% chance to attack
    newEnemy.intent = 'attack';
    newEnemy.intentValue = enemy.damage;
  } else if (roll < 90) {
    // 20% chance to defend
    newEnemy.intent = 'defend';
    newEnemy.intentValue = Math.ceil(enemy.damage * 0.8); // Defense slightly less than attack
  } else {
    // 10% chance to buff
    newEnemy.intent = 'buff';
    newEnemy.intentValue = Math.ceil(enemy.damage * 0.3); // Small buff to future attacks
  }
  
  return newEnemy;
};

// Function to get a random enemy based on difficulty
export const getRandomEnemy = (difficulty: 'basic' | 'elite' | 'boss' = 'basic'): Enemy => {
  let enemyPool: Enemy[];
  
  switch (difficulty) {
    case 'basic':
      enemyPool = basicEnemies;
      break;
    case 'elite':
      enemyPool = eliteEnemies;
      break;
    case 'boss':
      enemyPool = bossEnemies;
      break;
    default:
      enemyPool = basicEnemies;
  }
  
  const randomIndex = Math.floor(Math.random() * enemyPool.length);
  
  // Clone the enemy and assign a new ID
  const selectedEnemy = { 
    ...enemyPool[randomIndex], 
    id: generateId(),
    currentHealth: enemyPool[randomIndex].maxHealth // Reset health
  };
  
  // Set initial intent
  return getNextIntent(selectedEnemy);
};
