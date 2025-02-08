import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CharacterClass, WalletType, CardType, Rarity, Effect } from '@prisma/client';

interface GameState {
  // Auth State
  isConnected: boolean;
  walletAddress: string | null;
  walletType: WalletType | null;
  emailAuth: {
    token: string | null;
    email: string | null;
  };

  // Game State
  currentCharacter: Character | null;
  inBattle: boolean;
  playerHand: Card[];
  playerDeck: Card[];
  playerDiscardPile: Card[];
  originalDeck: Card[];

  // Actions
  connectWallet: (address: string, type: WalletType) => void;
  disconnectWallet: () => void;
  checkAuth: () => Promise<boolean>;
  setCharacter: (character: Character | null) => void;
  startBattle: () => void;
  endBattle: () => void;
  drawCard: () => void;
  playCard: (cardIndex: number) => void;
  discardHand: () => void;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string) => Promise<boolean>;
  logoutEmail: () => void;
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
  equipment?: Equipment[];
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

interface Equipment {
  id: string;
  name: string;
  description: string;
  slot: string;
  rarity: Rarity;
  effects: Effect[];
}

const initialState = {
  isConnected: false,
  walletAddress: null,
  walletType: null,
  emailAuth: {
    token: null,
    email: null,
  },
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

      connectWallet: (address, type) =>
        set({
          isConnected: true,
          walletAddress: address,
          walletType: type,
        }),

      disconnectWallet: () => set(initialState),

      checkAuth: async () => {
        try {
          const response = await fetch('/api/character/get', {
            credentials: 'include',
          });

          if (!response.ok) {
            set(initialState);
            return false;
          }

          set({ isConnected: true });
          return true;
        } catch (error) {
          console.error('Failed to check auth:', error);
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
        const { playerDeck, playerHand, playerDiscardPile, originalDeck } = get();

        if (playerDeck.length === 0) {
          if (playerDiscardPile.length === 0) {
            if (originalDeck.length === 0) return;

            const shuffledDeck = [...originalDeck].sort(() => Math.random() - 0.5);
            set({
              playerDeck: shuffledDeck.slice(1),
              playerHand: [...playerHand, shuffledDeck[0]],
            });
            return;
          }

          const shuffledDeck = [...playerDiscardPile].sort(() => Math.random() - 0.5);
          set({
            playerDeck: shuffledDeck.slice(1),
            playerHand: [...playerHand, shuffledDeck[0]],
            playerDiscardPile: [],
          });
          return;
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

      loginWithEmail: async (email, password) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) return false;

          const { user } = await response.json();
          set({
            isConnected: true,
            emailAuth: { email: user.email, token: null },
          });
          return true;
        } catch (error) {
          console.error('Email login error:', error);
          return false;
        }
      },

      registerWithEmail: async (email, password) => {
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          return response.ok;
        } catch (error) {
          console.error('Email registration error:', error);
          return false;
        }
      },

      logoutEmail: () => {
        set(initialState);
      },
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        isConnected: state.isConnected,
        emailAuth: state.emailAuth,
      }),
    }
  )
);