
import { v4 as uuidv4 } from 'uuid';
import {  Character, Item } from '../types';
import { createStarterDeck } from '../../lib/cardData';

// Function to calculate experience required for next level
export const calculateExperienceForLevel = (level: number): number => {
  return 100 + (level * 50);
};

// Function to initialize a new character
export const initializeCharacter = (name: string, characterClass: string): Character => {
  const initialDeck = createStarterDeck();
  const initialDrawPile = [...initialDeck]; // Copy the initial deck to the draw pile
  
  return {
    id: uuidv4(),
    name: name,
    level: 1,
    experience: 0,
    experienceToNextLevel: calculateExperienceForLevel(1),
    gold: 100,
    maxHealth: 100,
    currentHealth: 100,
    maxEnergy: 3,
    currentEnergy: 3,
    class: characterClass,
    deck: initialDeck,
    drawPile: initialDrawPile,
    hand: [],
    discardPile: [],
    inventory: [],
    equippedItems: {
      weapon: undefined,
      armor: undefined,
      accessory: undefined
    },
  };
};

// Function to initialize game state
export const initializeGameState = (characterName: string, characterClass: string): any => {
  return {
    characters: [],
    activeCharacter: initializeCharacter(characterName, characterClass),
    currentEnemy: null,
    inBattle: false,
    turn: 'player',
    round: 1,
    battleTurn: 1,
    gamePhase: 'menu',
    temporaryEffects: {
      playerDefense: 0,
      enemyDefense: 0,
      playerBuffs: [],
      enemyBuffs: []
    },
    map: null,
    user: null,
    inBattleMode: false,
    quickAccessOpen: false
  };
};

// Function to gain experience
export const gainExperience = (character: Character, experience: number) => {
  character.experience += experience;
  // Level up if enough experience is gained
  const requiredExperience = 100 + character.level * 50;
  if (character.experience >= requiredExperience) {
    character.level += 1;
    character.experience -= requiredExperience;
    character.maxHealth += 10;
    character.currentHealth = character.maxHealth;
    character.maxEnergy += 1;
    character.currentEnergy = character.maxEnergy;
  }
};

// Function to equip an item
export const equipItem = (character: Character, item: Item) => {
  if (item.type === 'weapon') {
    character.equippedItems.weapon = item;
  } else if (item.type === 'armor') {
    character.equippedItems.armor = item;
  } else if (item.type === 'accessory') {
    character.equippedItems.accessory = item;
  }
};

// Function to unequip an item
export const unequipItem = (character: Character, itemType: 'weapon' | 'armor' | 'accessory') => {
  // Set to undefined instead of null to match the type (Item | undefined)
  character.equippedItems[itemType] = undefined;
};