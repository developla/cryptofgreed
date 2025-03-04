import { GameState, Action, Character } from '../types';
import { saveGameState } from '../../lib/storage';
import { shuffleArray, calculateExperienceForLevel } from '../gameUtils';

export const handleCreateCharacter = (state: GameState, action: Action): GameState => {
  if (action.type !== 'CREATE_CHARACTER') return state;
  
  const { payload } = action;
  const shuffledDeck = shuffleArray(payload.deck);
  const newCharacter: Character = {
    ...payload,
    hand: [],
    discardPile: [],
    drawPile: shuffledDeck,
    inventory: [],
    equippedItems: {},
    experienceToNextLevel: calculateExperienceForLevel(payload.level || 1)
  };
  
  const newState: GameState = {
    ...state,
    characters: [...state.characters, newCharacter],
    activeCharacter: newCharacter, // Use new character directly instead of conditional
    gamePhase: 'character-selection'
  };
  
  saveGameState(newState);
  return newState;
};

export const handleSelectCharacter = (state: GameState, action: Action): GameState => {
  if (action.type !== 'SELECT_CHARACTER') return state;
  
  const character = state.characters.find(char => char.id === action.payload);
  if (!character) return state;
  
  const newState: GameState = {
    ...state,
    activeCharacter: character,
    map: state.map || null,
    gamePhase: 'map'
  };
  
  saveGameState(newState);
  return newState;
};

export const handleUpgradeCard = (state: GameState, action: Action): GameState => {
  if (action.type !== 'UPGRADE_CARD') return state;
  if (!state.activeCharacter) return state;
  
  const { cardId } = action.payload;
  
  // Find the card to upgrade
  const cardToUpgrade = state.activeCharacter.deck.find(card => card.id === cardId);
  if (!cardToUpgrade || cardToUpgrade.upgraded) return state; // Already upgraded or not found
  
  // Create upgraded version of the card
  const upgradedCard = {
    ...cardToUpgrade,
    upgraded: true
  };
  
  // Apply upgrades based on card type
  switch (upgradedCard.type) {
    case 'attack':
      // Increase damage by 50% (rounded up)
      upgradedCard.value = Math.ceil(upgradedCard.value * 1.5);
      // Update description
      upgradedCard.description = upgradedCard.description.replace(
        /Deal \d+ damage/,
        `Deal ${upgradedCard.value} damage`
      );
      break;
    case 'defense':
      // Increase block by 50% (rounded up)
      upgradedCard.value = Math.ceil(upgradedCard.value * 1.5);
      // Update description
      upgradedCard.description = upgradedCard.description.replace(
        /Gain \d+ block/,
        `Gain ${upgradedCard.value} block`
      );
      break;
    case 'buff':
    case 'debuff':
    case 'special':
      // Increase effect value by 1-2 based on rarity
      const increaseAmount = upgradedCard.rarity === 'common' ? 1 : 2;
      upgradedCard.value += increaseAmount;
      
      // Update description with new value
      if (upgradedCard.description.includes(String(cardToUpgrade.value))) {
        upgradedCard.description = upgradedCard.description.replace(
          String(cardToUpgrade.value),
          String(upgradedCard.value)
        );
      }
      break;
  }
  
  // Some cards might have their energy cost reduced by 1 (min 0) if they're rare or better
  if ((upgradedCard.rarity === 'rare' || upgradedCard.rarity === 'epic' || upgradedCard.rarity === 'legendary') 
      && upgradedCard.energyCost > 0) {
    upgradedCard.energyCost -= 1;
    // Update description for energy cost
    if (upgradedCard.description.includes(`Costs ${cardToUpgrade.energyCost} energy`)) {
      upgradedCard.description = upgradedCard.description.replace(
        `Costs ${cardToUpgrade.energyCost} energy`,
        `Costs ${upgradedCard.energyCost} energy`
      );
    }
  }
  
  // Update the deck with the upgraded card
  const updatedDeck = state.activeCharacter.deck.map(card => 
    card.id === cardId ? upgradedCard : card
  );
  
  // Also update the card in the draw, hand, and discard piles if present
  const updatedDrawPile = state.activeCharacter.drawPile.map(card => 
    card.id === cardId ? upgradedCard : card
  );
  
  const updatedHand = state.activeCharacter.hand.map(card => 
    card.id === cardId ? upgradedCard : card
  );
  
  const updatedDiscardPile = state.activeCharacter.discardPile.map(card => 
    card.id === cardId ? upgradedCard : card
  );
  
  const updatedCharacter = {
    ...state.activeCharacter,
    deck: updatedDeck,
    drawPile: updatedDrawPile,
    hand: updatedHand,
    discardPile: updatedDiscardPile
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

export const handleEquipItem = (state: GameState, action: Action): GameState => {
  if (action.type !== 'EQUIP_ITEM') return state;
  if (!state.activeCharacter) return state;
  
  const item = action.payload;
  const slotName = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory' 
    ? item.type 
    : undefined;
    
  if (!slotName) return state;
  
  const updatedEquippedItems = {
    ...state.activeCharacter.equippedItems,
    [slotName]: item
  };
  
  const updatedCharacter = {
    ...state.activeCharacter,
    equippedItems: updatedEquippedItems
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

export const handleUnequipItem = (state: GameState, action: Action): GameState => {
  if (action.type !== 'UNEQUIP_ITEM') return state;
  if (!state.activeCharacter) return state;
  
  const slotName = action.payload;
  const updatedEquippedItems = {...state.activeCharacter.equippedItems};
  
  if (slotName in updatedEquippedItems) {
    delete updatedEquippedItems[slotName as keyof typeof updatedEquippedItems];
  }
  
  const updatedCharacter = {
    ...state.activeCharacter,
    equippedItems: updatedEquippedItems
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

export const handleAddCardToDeck = (state: GameState, action: Action): GameState => {
  if (action.type !== 'ADD_CARD_TO_DECK') return state;
  if (!state.activeCharacter) return state;
  
  const updatedCharacter = {
    ...state.activeCharacter,
    deck: [...state.activeCharacter.deck, action.payload]
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

export const handleBuyCard = (state: GameState, action: Action): GameState => {
  if (action.type !== 'BUY_CARD') return state;
  if (!state.activeCharacter) return state;
  
  const { card, cost } = action.payload;
  if (state.activeCharacter.gold < cost) return state;
  
  const updatedCharacter = {
    ...state.activeCharacter,
    deck: [...state.activeCharacter.deck, card],
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

export const handleDiscardCardFromDeck = (state: GameState, action: Action): GameState => {
  if (action.type !== 'DISCARD_CARD_FROM_DECK') return state;
  if (!state.activeCharacter) return state;
  
  const { cardId } = action.payload;
  
  // Ensure minimum deck size
  if (state.activeCharacter.deck.length <= 10) {
    console.log('Cannot discard card: minimum deck size reached');
    return state; // Don't allow discarding if deck is at minimum size
  }
  
  console.log('Discarding card with ID:', cardId);
  
  // Filter out the card to discard
  const updatedDeck = state.activeCharacter.deck.filter(card => card.id !== cardId);
  
  // Also remove from draw, hand, and discard piles if present
  const updatedDrawPile = state.activeCharacter.drawPile.filter(card => card.id !== cardId);
  const updatedHand = state.activeCharacter.hand.filter(card => card.id !== cardId);
  const updatedDiscardPile = state.activeCharacter.discardPile.filter(card => card.id !== cardId);
  
  const updatedCharacter = {
    ...state.activeCharacter,
    deck: updatedDeck,
    drawPile: updatedDrawPile,
    hand: updatedHand,
    discardPile: updatedDiscardPile
  };
  
  const updatedCharacters = state.characters.map(c => 
    c.id === updatedCharacter.id ? updatedCharacter : c
  );
  
  console.log('Deck size after discard:', updatedDeck.length);
  
  const newState = {
    ...state,
    activeCharacter: updatedCharacter,
    characters: updatedCharacters
  };
  
  saveGameState(newState);
  return newState;
};

export const handleBuyEquipment = (state: GameState, action: Action): GameState => {
  if (action.type !== 'BUY_EQUIPMENT') return state;
  if (!state.activeCharacter) return state;
  
  const { equipment, cost } = action.payload;
  if (state.activeCharacter.gold < cost) return state;
  
  const updatedCharacter = {
    ...state.activeCharacter,
    inventory: [...state.activeCharacter.inventory, equipment],
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

export const handleHealPlayer = (state: GameState, action: Action): GameState => {
  if (action.type !== 'HEAL_PLAYER') return state;
  if (!state.activeCharacter) return state;
  
  const { amount } = action.payload;
  const updatedHealth = Math.min(
    state.activeCharacter.currentHealth + amount,
    state.activeCharacter.maxHealth
  );
  
  const updatedCharacter = {
    ...state.activeCharacter,
    currentHealth: updatedHealth
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
