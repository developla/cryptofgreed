import { GameState, Action } from './types';
import * as CharacterReducers from './reducers/characterReducers';
import * as BattleReducers from './reducers/battleReducers';
import * as DeckReducers from './reducers/deckReducers';
import * as MapReducers from './reducers/mapReducers';
import * as InventoryReducers from './reducers/inventoryReducers';
import * as UserReducers from './reducers/userReducers';
// Import NFT utility functions (just import, no direct usage yet)
import { handleNFTProgression } from '../utils/nftUtils';

// Main reducer function that delegates to specific reducers based on action type
export const gameReducer = (state: GameState, action: Action): GameState => {
  console.log('Reducer called with action:', action.type, 'payload:', 
    'payload' in action ? action.payload : 'no payload');
  
  // User-related actions
  if (action.type === 'LOGIN') {
    console.log('Handling LOGIN action in reducer');
    const newState = UserReducers.handleLogin(state, action);
    console.log('State after LOGIN:', newState);
    return newState;
  }
  if (action.type === 'REGISTER') {
    return UserReducers.handleRegister(state, action);
  }
  if (action.type === 'LOGOUT') {
    return UserReducers.handleLogout(state, action);
  }
  if (action.type === 'NAVIGATE') {
    return UserReducers.handleNavigate(state, action);
  }
  if (action.type === 'TOGGLE_QUICK_ACCESS') {
    return UserReducers.handleToggleQuickAccess(state, action);
  }
  if (action.type === 'BUY_CHARACTER_SLOT') {
    return UserReducers.handleBuyCharacterSlot(state, action);
  }
  if (action.type === 'CLEAR_LOGIN_ERROR') {
    return UserReducers.handleClearLoginError(state, action);
  }
  if (action.type === 'CLEAR_REGISTRATION_STATUS') {
    return UserReducers.handleClearRegistrationStatus(state, action);
  }

  // Character-related actions
  if (action.type === 'CREATE_CHARACTER') {
    return CharacterReducers.handleCreateCharacter(state, action);
  }
  if (action.type === 'SELECT_CHARACTER') {
    return CharacterReducers.handleSelectCharacter(state, action);
  }
  if (action.type === 'UPGRADE_CARD') {
    return CharacterReducers.handleUpgradeCard(state, action);
  }
  if (action.type === 'EQUIP_ITEM') {
    return CharacterReducers.handleEquipItem(state, action);
  }
  if (action.type === 'UNEQUIP_ITEM') {
    return CharacterReducers.handleUnequipItem(state, action);
  }
  if (action.type === 'ADD_CARD_TO_DECK') {
    return CharacterReducers.handleAddCardToDeck(state, action);
  }
  if (action.type === 'DISCARD_CARD_FROM_DECK') {
    return CharacterReducers.handleDiscardCardFromDeck(state, action);
  }
  if (action.type === 'BUY_CARD') {
    return CharacterReducers.handleBuyCard(state, action);
  }
  if (action.type === 'BUY_EQUIPMENT') {
    return CharacterReducers.handleBuyEquipment(state, action);
  }
  if (action.type === 'HEAL_PLAYER') {
    return CharacterReducers.handleHealPlayer(state, action);
  }
  if (action.type === 'SPEND_GOLD') {
    return InventoryReducers.handleSpendGold(state, action);
  }

  // Battle-related actions
  if (action.type === 'START_BATTLE') {
    return BattleReducers.handleStartBattle(state, action);
  }
  if (action.type === 'PLAY_CARD') {
    return BattleReducers.handlePlayCard(state, action);
  }
  if (action.type === 'END_TURN') {
    return BattleReducers.handleEndTurn(state);
  }
  if (action.type === 'ENEMY_ACTION') {
    return BattleReducers.handleEnemyAction(state);
  }
  if (action.type === 'END_BATTLE') {
    // Log NFT progression (placeholder - not actually calling the function here)
    // Real implementation would integrate NFT logic directly in the reducer
    console.log('END_BATTLE triggered - NFT progression would be handled');
    return BattleReducers.handleEndBattle(state, action);
  }
  if (action.type === 'DAMAGE_ENEMY') {
    return BattleReducers.handleDamageEnemy(state, action);
  }
  if (action.type === 'DAMAGE_PLAYER') {
    return BattleReducers.handleDamagePlayer(state, action);
  }
  if (action.type === 'ADD_PLAYER_DEFENSE') {
    return BattleReducers.handleAddPlayerDefense(state, action);
  }

  // Deck-related actions
  if (action.type === 'INITIALIZE_DRAW_PILE') {
    return BattleReducers.handleInitializeDrawPile(state);
  }
  if (action.type === 'SHUFFLE_DISCARD_TO_DRAW') {
    return BattleReducers.handleShuffleDiscardToDraw(state);
  }
  if (action.type === 'DRAW_CARD') {
    return DeckReducers.handleDrawCard(state, action);
  }

  // Map-related actions
  if (action.type === 'GENERATE_MAP') {
    return MapReducers.handleGenerateMap(state, action);
  }
  if (action.type === 'VISIT_NODE') {
    return MapReducers.handleVisitNode(state, action);
  }

  // Inventory-related actions
  if (action.type === 'BUY_POTION') {
    return InventoryReducers.handleBuyPotion(state, action);
  }
  if (action.type === 'USE_POTION') {
    return InventoryReducers.handleUsePotion(state, action);
  }

  // Return the unchanged state for unknown actions
  return state;
};
