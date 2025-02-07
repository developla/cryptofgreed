import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CharacterClass, WalletType, CardType, Rarity } from "@prisma/client";

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

  // Actions
  connectWallet: (address: string, type: WalletType) => void;
  disconnectWallet: () => void;
  checkWalletConnection: () => void;
  setCharacter: (character: Character) => void;
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
  deck: Card[];
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
  effects?: CardEffect[];
}

interface CardEffect {
  type: string;
  value: number;
  duration?: number;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial State
      isConnected: false,
      walletAddress: null,
      walletType: null,
      currentCharacter: null,
      inBattle: false,
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
          inBattle: false,
          playerHand: [],
          playerDeck: [],
          playerDiscardPile: [],
        }),

      checkWalletConnection: async () => {
        const { walletType, walletAddress } = get();
        if (!walletType || !walletAddress) return;

        try {
          let isStillConnected = false;

          if (walletType === WalletType.ETHEREUM) {
            const address = await window.ethereum?.request({
              method: "eth_accounts",
            });
            isStillConnected =
              address?.[0]?.toLowerCase() === walletAddress.toLowerCase();
          } else if (walletType === WalletType.SOLANA) {
            const phantom = (window as any).solana;
            isStillConnected =
              phantom?.isConnected &&
              phantom?.publicKey?.toString() === walletAddress;
          }

          if (!isStillConnected) {
            set({
              isConnected: false,
              walletAddress: null,
              walletType: null,
              currentCharacter: null,
              inBattle: false,
              playerHand: [],
              playerDeck: [],
              playerDiscardPile: [],
            });
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error);
          set({
            isConnected: false,
            walletAddress: null,
            walletType: null,
            currentCharacter: null,
            inBattle: false,
            playerHand: [],
            playerDeck: [],
            playerDiscardPile: [],
          });
        }
      },

      setCharacter: (character) =>
        set({
          currentCharacter: character,
          playerDeck: [...character.deck],
        }),

      startBattle: () => {
        const { currentCharacter } = get();
        if (!currentCharacter) return;

        set({
          inBattle: true,
          playerHand: [],
          playerDeck: [...currentCharacter.deck],
          playerDiscardPile: [],
        });
      },

      endBattle: () =>
        set({
          inBattle: false,
          playerHand: [],
          playerDeck: [],
          playerDiscardPile: [],
        }),

      drawCard: () => {
        const { playerDeck, playerHand, playerDiscardPile } = get();

        if (playerDeck.length === 0) {
          if (playerDiscardPile.length === 0) return;

          // Shuffle discard pile into deck
          const shuffledDeck = [...playerDiscardPile].sort(
            () => Math.random() - 0.5
          );

          set({
            playerDeck: shuffledDeck,
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
    }),
    {
      name: "game-storage",
      partialize: (state) => ({
        isConnected: state.isConnected,
        walletAddress: state.walletAddress,
        walletType: state.walletType,
      }),
    }
  )
);
