import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  CharacterClass,
  WalletType,
  CardType,
  Rarity,
  Effect,
} from '@prisma/client';

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

interface GameState {
  // Auth State
  isConnected: boolean;
  walletAddress: string | null;
  walletType: WalletType | null;

  // Game State
  currentCharacter: Character | null;
  inBattle: boolean;
  playerHand: Card[];
  playerDeck: Card[];
  playerDiscardPile: Card[];
  originalDeck: Card[]; // New state to store the original deck

  // Actions
  connectWallet: (address: string, type: WalletType) => void;
  disconnectWallet: () => void;
  checkWalletConnection: () => Promise<boolean>;
  setCharacter: (character: Character | null) => void;
  startBattle: () => void;
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
  deck?: Card[];
}

interface Card {
  id: string;
  name: string;
  description: string;
  type: CardType;
  rarity: Rarity;
  energy: number;
  damage?: number;
  block?: number;
  effects?: Effect[];
}

const initialState = {
  isConnected: false,
  walletAddress: null,
  walletType: null,
  currentCharacter: null,
  inBattle: false,
  playerHand: [],
  playerDeck: [],
  playerDiscardPile: [],
  originalDeck: [],
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      connectWallet: (address, type) =>
        set({
          isConnected: true,
          walletAddress: address,
          walletType: type,
        }),

      disconnectWallet: () => set(initialState),

      checkWalletConnection: async () => {
        const { walletType, walletAddress } = get();
        if (!walletType || !walletAddress) return false;

        try {
          let isStillConnected = false;

          if (walletType === WalletType.ETHEREUM && window.ethereum) {
            const accounts = await window.ethereum.request({
              method: 'eth_accounts',
            });
            isStillConnected =
              accounts?.[0]?.toLowerCase() === walletAddress.toLowerCase();
          } else if (walletType === WalletType.SOLANA && window.solana) {
            isStillConnected =
              window.solana.isConnected &&
              window.solana.publicKey?.toString() === walletAddress;
          }

          if (!isStillConnected) {
            set(initialState);
            return false;
          }

          set({ isConnected: true });
          return true;
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
          set(initialState);
          return false;
        }
      },

      setCharacter: (character) => {
        if (!character) {
          set({
            currentCharacter: null,
            playerDeck: [],
            originalDeck: [],
          });
          return;
        }

        // Store both the current deck and original deck
        const deck = character.deck || [];
        set({
          currentCharacter: character,
          playerDeck: [...deck],
          originalDeck: [...deck],
        });
      },

      startBattle: () => {
        const { originalDeck } = get();
        if (!originalDeck.length) return;

        // Create a fresh shuffled deck from the original deck
        const shuffledDeck = [...originalDeck].sort(() => Math.random() - 0.5);

        set({
          inBattle: true,
          playerHand: [],
          playerDeck: shuffledDeck,
          playerDiscardPile: [],
        });
      },

      endBattle: () => {
        set({
          inBattle: false,
          playerHand: [],
          playerDeck: [],
          playerDiscardPile: [],
        });
      },

      drawCard: () => {
        const { playerDeck, playerHand, playerDiscardPile, originalDeck } =
          get();

        // If deck is empty, check discard pile
        if (playerDeck.length === 0) {
          // If discard pile is also empty, reset from original deck
          if (playerDiscardPile.length === 0) {
            if (originalDeck.length === 0) return;

            const shuffledDeck = [...originalDeck].sort(
              () => Math.random() - 0.5
            );
            set({
              playerDeck: shuffledDeck.slice(1),
              playerHand: [...playerHand, shuffledDeck[0]],
            });
            return;
          }

          // Shuffle discard pile into new deck
          const shuffledDeck = [...playerDiscardPile].sort(
            () => Math.random() - 0.5
          );
          set({
            playerDeck: shuffledDeck.slice(1),
            playerHand: [...playerHand, shuffledDeck[0]],
            playerDiscardPile: [],
          });
          return;
        }

        // Draw from current deck
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
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        walletType: state.walletType,
        isConnected: state.isConnected,
      }),
    }
  )
);
