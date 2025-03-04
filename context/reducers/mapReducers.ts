import { GameState, Action } from '../types';
import { saveGameState } from '../../lib/storage';
import { generateMap } from '../utils/mapUtils';

export const handleGenerateMap = (state: GameState, action: Action): GameState => {
  if (action.type !== 'GENERATE_MAP') return state;
  
  console.log('Generating new map for level:', action.payload.level);
  
  // Get player health information for dynamic balancing
  const playerHealth = state.activeCharacter ? {
    current: state.activeCharacter.currentHealth,
    max: state.activeCharacter.maxHealth
  } : undefined;
  
  // Generate a balanced map using player health info
  const newMap = generateMap(action.payload.level, playerHealth);
  
  const newState: GameState = {
    ...state,
    map: newMap,
    gamePhase: 'map'
  };
  
  saveGameState(newState);
  return newState;
};

export const handleVisitNode = (state: GameState, action: Action): GameState => {
  if (action.type !== 'VISIT_NODE') return state;
  if (!state.map) return state;
  
  const nodeId = action.payload.nodeId;
  const node = state.map.nodes.find(n => n.id === nodeId);
  if (!node || !node.available) return state;
  
  console.log('Visiting node:', nodeId, 'of type:', node.type);
  
  // Mark the current node as visited
  const updatedNodes = state.map.nodes.map(n => {
    if (n.id === nodeId) {
      return { ...n, visited: true };
    }
    
    // Make connected nodes available if they aren't already
    if (node.connections.includes(n.id)) {
      return { ...n, available: true };
    }
    
    return n;
  });
  
  let gamePhase = state.gamePhase;
  switch (node.type) {
    case 'battle':
    case 'elite':
    case 'boss':
      gamePhase = 'battle';
      break;
    case 'shop':
      gamePhase = 'shop';
      break;
    case 'rest':
      gamePhase = 'rest';
      break;
    case 'event':
      gamePhase = 'event';
      break;
  }
  
  // Check if there are any available nodes left that haven't been visited
  const hasAvailableNodes = updatedNodes.some(n => n.available && !n.visited);
  console.log('Has available nodes after visit:', hasAvailableNodes);
  
  // Only update the state with new nodes, don't regenerate here
  const newState: GameState = {
    ...state,
    map: {
      ...state.map,
      nodes: updatedNodes,
      currentNode: nodeId
    },
    gamePhase
  };
  
  saveGameState(newState);
  return newState;
};
