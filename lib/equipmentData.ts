import { Item, ItemType } from '../context/types';
import { v4 as uuidv4 } from 'uuid';

// Equipment name generators
const weaponPrefixes: string[] = ['Sharp', 'Rusty', 'Ancient', 'Gleaming', 'Brutal', 'Mystic', 'Enchanted', 'Savage'];
const weaponTypes: string[] = ['Sword', 'Axe', 'Mace', 'Dagger', 'Staff', 'Wand', 'Bow', 'Spear'];

const armorPrefixes: string[] = ['Sturdy', 'Rugged', 'Reinforced', 'Plated', 'Protective', 'Tough', 'Heavy', 'Light'];
const armorTypes: string[] = ['Chestplate', 'Chainmail', 'Shield', 'Helmet', 'Gauntlets', 'Boots', 'Plate Armor', 'Leather Armor'];

const accessoryPrefixes: string[] = ['Lucky', 'Mystical', 'Ancient', 'Glowing', 'Powerful', 'Enchanted', 'Magical', 'Blessed'];
const accessoryTypes: string[] = ['Amulet', 'Ring', 'Bracelet', 'Charm', 'Talisman', 'Emblem', 'Pendant', 'Relic'];

// Equipment description generators
const generateWeaponDescription = (prefix: string, type: string, value: number): string => {
  return `A ${prefix.toLowerCase()} ${type.toLowerCase()} that deals +${value} damage.`;
};

const generateArmorDescription = (prefix: string, type: string, value: number): string => {
  return `${prefix} ${type.toLowerCase()} that provides +${value} defense.`;
};

const generateAccessoryDescription = (prefix: string, type: string, value: number): string => {
  return `A ${prefix.toLowerCase()} ${type.toLowerCase()} that enhances your abilities by +${value}.`;
};

// Rarity modifiers
const rarityModifiers = {
  common: 1,
  uncommon: 1.5,
  rare: 2.5,
  epic: 4,
  legendary: 6
};

// Base stats by equipment type
const getBaseStats = (type: 'weapon' | 'armor' | 'accessory'): { baseMin: number, baseMax: number } => {
  switch (type) {
    case 'weapon':
      return { baseMin: 2, baseMax: 5 };
    case 'armor':
      return { baseMin: 3, baseMax: 7 };
    case 'accessory':
      return { baseMin: 1, baseMax: 3 };
    default:
      return { baseMin: 1, baseMax: 3 };
  }
};

// Generate a random item name
const generateItemName = (type: 'weapon' | 'armor' | 'accessory'): { prefix: string, typeName: string } => {
  let prefixes: string[];  // Explicitly declare as string array
  let types: string[];     // Explicitly declare as string array
  
  switch (type) {
    case 'weapon':
      prefixes = weaponPrefixes;
      types = weaponTypes;
      break;
    case 'armor':
      prefixes = armorPrefixes;
      types = armorTypes;
      break;
    case 'accessory':
      prefixes = accessoryPrefixes;
      types = accessoryTypes;
      break;
    default:
      prefixes = [];
      types = [];
  }
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const typeName = types[Math.floor(Math.random() * types.length)];
  
  return { prefix, typeName };
};

// Generate a random value within a range, modified by rarity
const generateStatValue = (min: number, max: number, rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): number => {
  const baseValue = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.floor(baseValue * rarityModifiers[rarity]);
};

// Main export function to generate random equipment
export const generateRandomEquipment = (
  type: 'weapon' | 'armor' | 'accessory', 
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' = 'common'
): Item => {
  const { baseMin, baseMax } = getBaseStats(type);
  const { prefix, typeName } = generateItemName(type);
  const value = generateStatValue(baseMin, baseMax, rarity);
  
  let description = '';
  
  switch (type) {
    case 'weapon':
      description = generateWeaponDescription(prefix, typeName, value);
      break;
    case 'armor':
      description = generateArmorDescription(prefix, typeName, value);
      break;
    case 'accessory':
      description = generateAccessoryDescription(prefix, typeName, value);
      break;
  }
  
  return {
    id: uuidv4(),
    name: `${prefix} ${typeName}`,
    type: type as ItemType,
    description,
    value,
    rarity,
    durability: Math.floor(50 * rarityModifiers[rarity]) // Added durability property
  };
};

// Function to generate a set of equipment
export const generateEquipmentSet = (level: number = 1): Item[] => {
  const equipmentSet: Item[] = [];
  
  // Determine rarity based on level
  const determineRarity = (level: number): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' => {
    const rarityRoll = Math.random() * 100;
    
    if (level >= 20 && rarityRoll < 5) return 'legendary';
    if (level >= 15 && rarityRoll < 15) return 'epic';
    if (level >= 10 && rarityRoll < 30) return 'rare';
    if (level >= 5 && rarityRoll < 50) return 'uncommon';
    return 'common';
  };
  
  // Generate one of each type
  equipmentSet.push(generateRandomEquipment('weapon', determineRarity(level)));
  equipmentSet.push(generateRandomEquipment('armor', determineRarity(level)));
  equipmentSet.push(generateRandomEquipment('accessory', determineRarity(level)));
  
  return equipmentSet;
};
