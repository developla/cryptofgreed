
import { Card, Character } from '../types';
import { shuffleArray } from './commonUtils';

// Function to draw a card from the draw pile
export const drawCard = (character: Character, amount: number = 1): Card[] => {
  const drawnCards: Card[] = [];
  for (let i = 0; i < amount; i++) {
    if (character.drawPile.length === 0) {
      if (character.discardPile.length > 0) {
        // Shuffle discard pile into draw pile
        character.drawPile = shuffleArray(character.discardPile);
        character.discardPile = [];
      } else {
        // No cards to draw
        break;
      }
    }
    const card = character.drawPile.pop();
    if (card) {
      drawnCards.push(card);
      character.hand.push(card);
    }
  }
  return drawnCards;
};

// Function to discard a card from hand
export const discardCard = (character: Character, cardId: string): Card | undefined => {
  const cardIndex = character.hand.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const [discardedCard] = character.hand.splice(cardIndex, 1);
    character.discardPile.push(discardedCard);
    return discardedCard;
  }
  return undefined;
};

// Function to add a card to the deck
export const addCardToDeck = (character: Character, card: Card) => {
  character.deck.push(card);
  character.discardPile.push(card); // Add to discard pile instead of draw pile
};

// Function to remove a card from the deck
export const removeCardFromDeck = (character: Character, cardId: string) => {
  character.deck = character.deck.filter(card => card.id !== cardId);
  character.drawPile = character.drawPile.filter(card => card.id !== cardId);
  character.hand = character.hand.filter(card => card.id !== cardId);
  character.discardPile = character.discardPile.filter(card => card.id !== cardId);
};
