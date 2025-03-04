
// This file re-exports all utilities from the utils directory
// for backward compatibility

// Re-export all utilities from individual files
export { 
  calculateExperienceForLevel,
  initializeCharacter,
  initializeGameState,
  gainExperience,
  equipItem,
  unequipItem
} from './utils/characterUtils';

export {
  dealDamage,
  healDamage
} from './utils/combatUtils';

export {
  drawCard,
  discardCard,
  addCardToDeck,
  removeCardFromDeck
} from './utils/deckUtils';

export {
  addItemToInventory,
  removeItemFromInventory,
  calculateTotalWeight,
  calculateItemWeight,
  isOverEncumbered
} from './utils/inventoryUtils';

export {
  MAX_NODES,
  calculateNodeType,
  generateMap
} from './utils/mapUtils';

export {
  shuffleArray
} from './utils/commonUtils';
