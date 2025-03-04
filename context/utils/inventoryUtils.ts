
import { Character, Item } from '../types';

// Function to add item to inventory
export const addItemToInventory = (character: Character, item: Item) => {
  character.inventory.push(item);
};

// Function to remove item from inventory
export const removeItemFromInventory = (character: Character, itemId: string) => {
  character.inventory = character.inventory.filter(item => item.id !== itemId);
};

// Function to calculate the total weight of the inventory
export const calculateTotalWeight = (character: Character): number => {
  let totalWeight = 0;
  character.inventory.forEach(item => {
    switch (item.type) {
      case 'weapon':
        totalWeight += 3;
        break;
      case 'armor':
        totalWeight += 5;
        break;
      case 'accessory':
        totalWeight += 1;
        break;
      default:
        totalWeight += 1;
        break;
    }
  });
  return totalWeight;
};

// Function to calculate weight of a single item (for inventory system page)
export const calculateItemWeight = (item: Item): number => {
  switch (item.type) {
    case 'weapon':
      return 3;
    case 'armor':
      return 5;
    case 'accessory':
      return 1;
    case 'potion':
      return 0.5;
    default:
      return 1;
  }
};

// Function to check if the character is over encumbered
export const isOverEncumbered = (character: Character): boolean => {
  const totalWeight = calculateTotalWeight(character);
  const maxWeight = 10 + character.level * 5;
  return totalWeight > maxWeight;
};
