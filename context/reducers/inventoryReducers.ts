
import { GameState, Action } from '../types';
import { saveGameState } from '../../lib/storage';

export const handleBuyPotion = (state: GameState, action: Action): GameState => {
  if (action.type !== 'BUY_POTION') return state;
  if (!state.activeCharacter) return state;
  
  const { potion, cost } = action.payload;
  if (state.activeCharacter.gold < cost) return state;
  
  const updatedCharacter = {
    ...state.activeCharacter,
    inventory: [...state.activeCharacter.inventory, potion],
    gold: state.activeCharacter.gold - cost
  };
  
  const updatedCharacters = state.characters.map(c => 
    c.id === updatedCharacter.id ? updatedCharacter : c
  );
  
  const newState: GameState = {
    ...state,
    activeCharacter: updatedCharacter,
    characters: updatedCharacters
  };
  
  saveGameState(newState);
  return newState;
};

export const handleUsePotion = (state: GameState, action: Action): GameState => {
  if (action.type !== 'USE_POTION') return state;
  if (!state.activeCharacter) return state;
  
  const potionId = action.payload.potionId;
  const potionIndex = state.activeCharacter.inventory.findIndex(item => item.id === potionId);
  if (potionIndex === -1) return state;
  
  const potion = state.activeCharacter.inventory[potionIndex];
  const newInventory = [
    ...state.activeCharacter.inventory.slice(0, potionIndex),
    ...state.activeCharacter.inventory.slice(potionIndex + 1)
  ];
  
  let updatedCharacter = {
    ...state.activeCharacter,
    inventory: newInventory
  };
  
  let updatedTemporaryEffects = {...state.temporaryEffects};
  
  if (potion.name === 'Health Potion') {
    updatedCharacter.currentHealth = Math.min(
      updatedCharacter.currentHealth + potion.value,
      updatedCharacter.maxHealth
    );
  } else if (potion.name === 'Energy Potion') {
    updatedCharacter.currentEnergy = Math.min(
      updatedCharacter.currentEnergy + potion.value,
      updatedCharacter.maxEnergy
    );
  } else if (potion.name === 'Strength Potion') {
    updatedTemporaryEffects.playerBuffs.push({
      type: 'strength',
      value: potion.value,
      duration: 3
    });
  }
  
  const updatedCharacters = state.characters.map(c => 
    c.id === updatedCharacter.id ? updatedCharacter : c
  );
  
  const newState: GameState = {
    ...state,
    activeCharacter: updatedCharacter,
    characters: updatedCharacters,
    temporaryEffects: updatedTemporaryEffects
  };
  
  saveGameState(newState);
  return newState;
};

export const handleSpendGold = (state: GameState, action: Action): GameState => {
  if (action.type !== 'SPEND_GOLD') return state;
  if (!state.activeCharacter) return state;
  
  const { amount } = action.payload;
  if (state.activeCharacter.gold < amount) return state;
  
  const updatedCharacter = {
    ...state.activeCharacter,
    gold: state.activeCharacter.gold - amount
  };
  
  const updatedCharacters = state.characters.map(c => 
    c.id === updatedCharacter.id ? updatedCharacter : c
  );
  
  const newState: GameState = {
    ...state,
    activeCharacter: updatedCharacter,
    characters: updatedCharacters
  };
  
  saveGameState(newState);
  return newState;
};
