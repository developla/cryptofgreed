
'use client'
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { loadGameState } from '../lib/storage';
import { gameReducer } from './gameReducer';
import { GameState, Action } from './types';

// Define the initial state
const initialState: GameState = {
  characters: [],
  activeCharacter: null,
  currentEnemy: null,
  inBattle: false,
  turn: 'player',
  round: 1,
  battleTurn: 1,
  gamePhase: 'login',
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

// Create the context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null
});

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved state from localStorage if available
  const [state, dispatch] = useReducer(gameReducer, initialState, () => {
    const savedState = loadGameState();
    console.log('Loaded initial state:', savedState);
    
    // If we're loading a state that has inBattle=true, make sure inBattleMode is also set
    if (savedState && savedState.inBattle) {
      savedState.inBattleMode = true;
    }
    
    return savedState || initialState;
  });

  // Debug when state changes
  useEffect(() => {
    console.log('Game state updated:', state);
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the GameContext
export const useGame = () => useContext(GameContext);

// Re-export types for easy access
export type { 
  GameState, 
  Action, 
  Card, 
  CardType,
  Character,
  Enemy,
  Item,
  ItemType,
  MapNode,
  GameMap,
  GamePhase,
  TurnType,
  User,
  NodeType
} from './types';
