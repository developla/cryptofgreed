
import { GameState, Action } from '../types';
import { saveGameState } from '../../lib/storage';
import { shuffleArray } from '../gameUtils';

export const handleInitializeDrawPile = (state: GameState, action: Action): GameState => {
  if (action.type !== 'INITIALIZE_DRAW_PILE') return state;
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

export const handleShuffleDiscardToDraw = (state: GameState, action: Action): GameState => {
  if (action.type !== 'SHUFFLE_DISCARD_TO_DRAW') return state;
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

export const handleDrawCard = (state: GameState, action: Action): GameState => {
  if (action.type !== 'DRAW_CARD') return state;
  if (!state.activeCharacter) return state;
  
  const { amount } = action.payload;
  let drawPile = [...state.activeCharacter.drawPile];
  let hand = [...state.activeCharacter.hand];
  for (let i = 0; i < amount && drawPile.length > 0; i++) {
    const card = drawPile.shift();
    if (card) {
      hand.push(card);
    }
  }
  
  if (drawPile.length === 0 && state.activeCharacter.discardPile.length > 0 && hand.length < amount) {
    const discardPile = shuffleArray([...state.activeCharacter.discardPile]);
    const remainingToDraw = amount - hand.length;
    for (let i = 0; i < remainingToDraw && discardPile.length > 0; i++) {
      const card = discardPile.shift();
      if (card) {
        hand.push(card);
      }
    }
    drawPile = [...drawPile, ...discardPile];
  }
  
  const updatedCharacter = {
    ...state.activeCharacter,
    hand,
    drawPile,
    discardPile: state.activeCharacter.discardPile.filter(card => 
      !hand.some(c => c.id === card.id)
    )
  };
  
  const newState: GameState = {
    ...state,
    activeCharacter: updatedCharacter
  };
  
  saveGameState(newState);
  return newState;
};
