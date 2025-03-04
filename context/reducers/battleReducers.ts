import { GameState, Action, GamePhase, Character } from '../types';
import { saveGameState } from '../../lib/storage';
import { getNextIntent } from '../../lib/enemyData';
// Import the NFT utility functions for future integration
import { handleNFTProgression } from '../../utils/nftUtils';
import { shuffleArray } from '../gameUtils';

export const handleStartBattle = (state: GameState, action: Action): GameState => {
  if (action.type !== 'START_BATTLE') return state;
  
  console.log('Starting battle with enemy:', action.payload.name);
  
  const newState: GameState = {
    ...state,
    currentEnemy: action.payload,
    inBattle: true,
    inBattleMode: true, // Set battle mode to true
    turn: 'player',
    round: 1,
    temporaryEffects: {
      playerDefense: 0,
      enemyDefense: 0,
      playerBuffs: [],
      enemyBuffs: []
    }
  };
  
  saveGameState(newState);
  return newState;
};

export const handlePlayCard = (state: GameState, action: Action): GameState => {
  if (action.type !== 'PLAY_CARD') return state;
  if (!state.activeCharacter || !state.currentEnemy) return state;
  
  const cardId = action.payload.cardId;
  const card = state.activeCharacter.hand.find(c => c.id === cardId);
  if (!card) return state;
  
  // Check if player has enough energy to play the card
  if (state.activeCharacter.currentEnergy < card.energyCost) {
    console.warn('Not enough energy to play card:', card.name);
    return state;
  }
  
  let damage = card.value;
  if (card.type === 'attack' && action.payload.isCriticalHit) {
    damage *= 2; // Double the damage for critical hits
  }
  
  // Create a new state object
  let newState = { ...state };
  
  // Apply card effects
  switch (card.type) {
    case 'attack':
      console.log('Playing attack card:', card.name, 'for', damage, 'damage');
      // Create a damage enemy action
      newState = handleDamageEnemy(newState, {
        type: 'DAMAGE_ENEMY',
        payload: { damage }
      });
      break;
    case 'defense':
      console.log('Playing defense card:', card.name, 'for', card.value, 'defense');
      newState = handleAddPlayerDefense(newState, {
        type: 'ADD_PLAYER_DEFENSE',
        payload: { amount: card.value }
      });
      break;
    default:
      console.log('Playing card:', card.name);
  }
  
  // Update character energy and move card from hand to discard pile
  const updatedCharacter = {
    ...newState.activeCharacter!,
    currentEnergy: newState.activeCharacter!.currentEnergy - card.energyCost,
    hand: newState.activeCharacter!.hand.filter(c => c.id !== cardId),
    discardPile: [...newState.activeCharacter!.discardPile, card]
  };
  
  // Update characters array with the modified character
  const updatedCharacters = newState.characters.map(char => 
    char.id === updatedCharacter.id ? updatedCharacter : char
  );
  
  // Create final state
  const finalState: GameState = {
    ...newState,
    activeCharacter: updatedCharacter,
    characters: updatedCharacters
  };
  
  saveGameState(finalState);
  return finalState;
};

export const handleEndTurn = (state: GameState): GameState => {
  console.log('Ending player turn');
  
  const newState: GameState = {
    ...state,
    turn: 'enemy',
    temporaryEffects: {
      ...state.temporaryEffects,
      playerDefense: 0
    }
  };
  
  saveGameState(newState);
  return newState;
};

export const handleEnemyAction = (state: GameState): GameState => {
  if (!state.currentEnemy || !state.activeCharacter) return state;
  
  console.log('Executing enemy action');
  
  let newState = { ...state };
  
  switch (state.currentEnemy.intent) {
    case 'attack':
      const damage = state.currentEnemy.intentValue;
      console.log(`Enemy attacks for ${damage} damage`);
      
      newState = handleDamagePlayer(newState, {
        type: 'DAMAGE_PLAYER',
        payload: { damage }
      });
      break;
    case 'defend':
      const defenseAmount = state.currentEnemy.intentValue;
      console.log(`Enemy defends for ${defenseAmount} defense`);
      
      newState = {
        ...newState,
        temporaryEffects: {
          ...newState.temporaryEffects,
          enemyDefense: newState.temporaryEffects.enemyDefense + defenseAmount
        }
      };
      break;
    case 'buff':
      console.log(`Enemy buffs itself`);
      // For simplicity, just increase the enemy's next attack damage
      break;
    default:
      console.log(`Enemy does nothing`);
  }
  
  if (newState.currentEnemy && newState.inBattle) {
    newState = {
      ...newState,
      currentEnemy: getNextIntent(newState.currentEnemy),
      turn: 'player',
      activeCharacter: {
        ...newState.activeCharacter!,
        currentEnergy: newState.activeCharacter!.maxEnergy
      }
    };
  }
  
  saveGameState(newState);
  return newState;
};

export const handleDamageEnemy = (state: GameState, action: Action): GameState => {
  if (action.type !== 'DAMAGE_ENEMY') return state;
  if (!state.currentEnemy) return state;
  
  const damage = action.payload.damage;
  const defense = state.temporaryEffects.enemyDefense;
  
  const actualDamage = Math.max(1, damage - defense);
  const remainingHealth = Math.max(0, state.currentEnemy.currentHealth - actualDamage);
  const isDefeated = remainingHealth <= 0;
  
  const updatedEnemy = {
    ...state.currentEnemy,
    currentHealth: remainingHealth
  };
  
  const newState: GameState = {
    ...state,
    currentEnemy: updatedEnemy,
    temporaryEffects: {
      ...state.temporaryEffects,
      enemyDefense: 0
    }
  };
  
  if (isDefeated) {
    console.log('Enemy defeated!');
    newState.inBattle = false;
    newState.gamePhase = 'reward';
  }
  
  saveGameState(newState);
  return newState;
};

export const handleDamagePlayer = (state: GameState, action: Action): GameState => {
  if (action.type !== 'DAMAGE_PLAYER') return state;
  if (!state.activeCharacter) return state;
  
  const damage = action.payload.damage;
  const defense = state.temporaryEffects.playerDefense;
  
  const actualDamage = Math.max(1, damage - defense);
  const remainingHealth = Math.max(0, state.activeCharacter.currentHealth - actualDamage);
  const isDefeated = remainingHealth <= 0;
  
  const updatedCharacter = {
    ...state.activeCharacter,
    currentHealth: remainingHealth
  };
  
  const updatedCharacters = state.characters.map(char => 
    char.id === updatedCharacter.id ? updatedCharacter : char
  );
  
  const gamePhase: GamePhase = isDefeated ? 'game-over' : state.gamePhase;
  
  const newState: GameState = {
    ...state,
    activeCharacter: updatedCharacter,
    characters: updatedCharacters,
    temporaryEffects: {
      ...state.temporaryEffects,
      playerDefense: 0
    },
    gamePhase: gamePhase,
    inBattle: !isDefeated,
    inBattleMode: !isDefeated,
  };
  
  if (isDefeated) {
    console.log('Player defeated - NFT progression (defeat) would trigger');
    // NFT progression handling would be triggered elsewhere (e.g., via a useEffect in the Battle component)
  }
  
  saveGameState(newState);
  return newState;
};

export const handleHealPlayer = (state: GameState, action: Action): GameState => {
  if (action.type !== 'HEAL_PLAYER') return state;
  if (!state.activeCharacter) return state;
  
  const healAmount = action.payload.amount;
  const newHealth = Math.min(state.activeCharacter.maxHealth, state.activeCharacter.currentHealth + healAmount);
  
  const updatedCharacter = {
    ...state.activeCharacter,
    currentHealth: newHealth
  };
  
  const updatedCharacters = state.characters.map(char => 
    char.id === updatedCharacter.id ? updatedCharacter : char
  );
  
  const newState: GameState = {
    ...state,
    activeCharacter: updatedCharacter,
    characters: updatedCharacters
  };
  
  saveGameState(newState);
  return newState;
};

export const handleAddPlayerDefense = (state: GameState, action: Action): GameState => {
  if (action.type !== 'ADD_PLAYER_DEFENSE') return state;
  
  const defenseAmount = action.payload.amount;
  
  const newState: GameState = {
    ...state,
    temporaryEffects: {
      ...state.temporaryEffects,
      playerDefense: state.temporaryEffects.playerDefense + defenseAmount
    }
  };
  
  saveGameState(newState);
  return newState;
};

export const handleEndBattle = (state: GameState, action: Action): GameState => {
  if (action.type !== 'END_BATTLE') return state;
  if (!state.activeCharacter || !state.currentEnemy) return state;
  
  console.log('Ending battle, awarding rewards');
  
  const experience = action.payload.experience;
  const gold = action.payload.gold || 0;
  
  // Award experience and gold to the active character
  let updatedCharacter: Character = {
    ...state.activeCharacter!,
    experience: state.activeCharacter!.experience + experience,
    gold: state.activeCharacter!.gold + gold
  };
  
  // Check if level up
  if (updatedCharacter.experience >= updatedCharacter.experienceToNextLevel) {
    console.log('Level up!');
    updatedCharacter = {
      ...updatedCharacter,
      level: updatedCharacter.level + 1,
      experience: updatedCharacter.experience - updatedCharacter.experienceToNextLevel,
      experienceToNextLevel: updatedCharacter.experienceToNextLevel * 1.5,
      maxHealth: updatedCharacter.maxHealth + 10,
      currentHealth: updatedCharacter.maxHealth + 10,
      maxEnergy: updatedCharacter.maxEnergy + 1,
      currentEnergy: updatedCharacter.maxEnergy + 1,
    } as Character;
  }
  
  const updatedCharacters: Character[] = state.characters.map(char =>
    char.id === updatedCharacter.id ? updatedCharacter : char
  );
  
  console.log('Battle victory - NFT progression (victory) would trigger');
  
  const newState: GameState = {
    ...state,
    activeCharacter: updatedCharacter,
    characters: updatedCharacters,
    currentEnemy: null,
    inBattle: false,
    inBattleMode: false, // Turn off battle mode when battle ends
    gamePhase: 'reward'
  };
  
  saveGameState(newState);
  return newState;
};

export const handleInitializeDrawPile = (state: GameState): GameState => {
  if (!state.activeCharacter) return state;
  
  const updatedCharacter = {
    ...state.activeCharacter,
    drawPile: shuffleArray([...state.activeCharacter.deck]),
    hand: [],
    discardPile: []
  };
  
  const newState: GameState = {
    ...state,
    activeCharacter: updatedCharacter
  };
  
  saveGameState(newState);
  return newState;
};

export const handleShuffleDiscardToDraw = (state: GameState): GameState => {
  if (!state.activeCharacter) return state;
  
  const shuffledDiscardPile = shuffleArray([...state.activeCharacter.discardPile]);
  const updatedCharacter = {
    ...state.activeCharacter,
    drawPile: [...state.activeCharacter.drawPile, ...shuffledDiscardPile],
    discardPile: []
  };
  
  const newState: GameState = {
    ...state,
    activeCharacter: updatedCharacter
  };
  
  saveGameState(newState);
  return newState;
};

// Export the draw card function from deckReducers
export { handleDrawCard } from './deckReducers';
