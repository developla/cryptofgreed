import { create } from "zustand";
import { CharacterClass, WalletType } from "@prisma/client";

interface GameState {
  // Auth State
  isConnected: boolean;
  walletAddress: string | null;
  walletType: WalletType | null;

  // Game State
  currentCharacter: Character | null;
  inBattle: boolean;
  currentEnemy: Enemy | null;
  playerHand: Card[];
  playerDeck: Card[];
  playerDiscardPile: Card[];

  // Actions
  connectWallet: (address: string, type: WalletType) => void;
  disconnectWallet: () => void;
  setCharacter: (character: Character) => void;
  startBattle: (enemy: Enemy) => void;
  endBattle: () => void;
  drawCard: () => void;
  playCard: (cardIndex: number) => void;
  discardHand: () => void;
}

interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  gold: number;
}

interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  intent: string;
  nextMove: () => void;
}

interface Card {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  type: "ATTACK" | "SKILL" | "POWER";
  effects: CardEffect[];
}

interface CardEffect {
  type: string;
  value: number;
  duration?: number;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  isConnected: false,
  walletAddress: null,
  walletType: null,
  currentCharacter: null,
  inBattle: false,
  currentEnemy: null,
  playerHand: [],
  playerDeck: [],
  playerDiscardPile: [],

  // Actions
  connectWallet: (address, type) =>
    set({
      isConnected: true,
      walletAddress: address,
      walletType: type,
    }),

  disconnectWallet: () =>
    set({
      isConnected: false,
      walletAddress: null,
      walletType: null,
      currentCharacter: null,
    }),

  setCharacter: (character) => set({ currentCharacter: character }),

  startBattle: (enemy) =>
    set({
      inBattle: true,
      currentEnemy: enemy,
      playerHand: [],
      playerDeck: [], // TODO: Load character's deck
      playerDiscardPile: [],
    }),

  endBattle: () =>
    set({
      inBattle: false,
      currentEnemy: null,
      playerHand: [],
      playerDeck: [],
      playerDiscardPile: [],
    }),

  drawCard: () => {
    const { playerDeck, playerHand, playerDiscardPile } = get();

    if (playerDeck.length === 0) {
      // Shuffle discard pile into deck
      if (playerDiscardPile.length > 0) {
        set({
          playerDeck: [...playerDiscardPile].sort(() => Math.random() - 0.5),
          playerDiscardPile: [],
        });
      } else {
        return; // No cards to draw
      }
    }

    const newDeck = [...playerDeck];
    const drawnCard = newDeck.pop()!;

    set({
      playerDeck: newDeck,
      playerHand: [...playerHand, drawnCard],
    });
  },

  playCard: (cardIndex) => {
    const { playerHand, playerDiscardPile } = get();
    const playedCard = playerHand[cardIndex];

    // TODO: Apply card effects

    set({
      playerHand: playerHand.filter((_, i) => i !== cardIndex),
      playerDiscardPile: [...playerDiscardPile, playedCard],
    });
  },

  discardHand: () => {
    const { playerHand, playerDiscardPile } = get();
    set({
      playerHand: [],
      playerDiscardPile: [...playerDiscardPile, ...playerHand],
    });
  },
}));
