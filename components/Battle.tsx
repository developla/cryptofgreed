import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import Character from './Character';
import Enemy from './Enemy';
import CardHand from './CardHand';
import EnergyMeter from './EnergyMeter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Shield, Trophy, Swords } from 'lucide-react';
import {
  handleNFTProgression,
  getWalletState,
  GameNFT,
  ProgressionSBT,
} from '@/utils/nftUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const Battle: React.FC = () => {
  const { state, dispatch } = useGame();
  const { activeCharacter, currentEnemy, turn, inBattle, temporaryEffects } =
    state;
  const { toast } = useToast();
  const [showNFTDialog, setShowNFTDialog] = useState(false);
  const [newNFT, setNewNFT] = useState<GameNFT | null>(null);
  const [progressionSBT, setProgressionSBT] = useState<ProgressionSBT | null>(
    null
  );
  const [upgradedNFT, setUpgradedNFT] = useState<{
    before: GameNFT;
    after: GameNFT;
  } | null>(null);

  // Ensure cards are drawn when battle starts
  useEffect(() => {
    if (inBattle && activeCharacter && activeCharacter.hand.length === 0) {
      if (
        activeCharacter.drawPile.length === 0 &&
        activeCharacter.discardPile.length > 0
      ) {
        // If draw pile is empty but discard pile has cards, shuffle discard into draw
        dispatch({ type: 'SHUFFLE_DISCARD_TO_DRAW' });
        // Wait a bit for the shuffle to complete before drawing
        setTimeout(() => {
          dispatch({ type: 'DRAW_CARD', payload: { amount: 5 } });
        }, 300);
      } else if (
        activeCharacter.drawPile.length === 0 &&
        activeCharacter.discardPile.length === 0
      ) {
        // If both are empty, initialize from the deck
        dispatch({ type: 'INITIALIZE_DRAW_PILE' });
        setTimeout(() => {
          dispatch({ type: 'DRAW_CARD', payload: { amount: 5 } });
        }, 300);
      } else if (activeCharacter.drawPile.length > 0) {
        // If draw pile has cards, just draw
        dispatch({ type: 'DRAW_CARD', payload: { amount: 5 } });
      }
    }
  }, [inBattle, activeCharacter, dispatch]);

  // Safety check - if somehow we end up in battle without an enemy, return to map
  useEffect(() => {
    if (inBattle && !currentEnemy && activeCharacter) {
      console.log(
        'Battle component detected inBattle=true but no currentEnemy, navigating to map'
      );
      dispatch({ type: 'NAVIGATE', payload: 'map' });
    }
  }, [inBattle, currentEnemy, activeCharacter, dispatch]);

  // Enhanced battle outcome and NFT progression effect
  useEffect(() => {
    if (!inBattle && activeCharacter && currentEnemy) {
      // Battle just ended
      const characterDefeated = activeCharacter.currentHealth <= 0;
      const outcome = characterDefeated ? 'defeat' : 'victory';

      // Call the NFT progression handler with simulation
      console.log(
        `Battle ended with ${outcome}. Triggering NFT progression...`
      );

      handleNFTProgression(outcome, activeCharacter.level);

      // For victory, show NFT rewards dialog after a short delay
      if (outcome === 'victory') {
        // Allow time for the simulated blockchain transaction
        setTimeout(() => {
          const updatedWallet = getWalletState();

          // Look for new NFT by comparing with initial wallet state
          // This is a simulation - in real implementation we'd get this directly from the blockchain
          if (updatedWallet.inventoryNFTs.length > 0) {
            const latestNFT =
              updatedWallet.inventoryNFTs[
                updatedWallet.inventoryNFTs.length - 1
              ];
            setNewNFT(latestNFT);
          }

          // Look for new progression SBT
          if (updatedWallet.progressionSBTs.length > 0) {
            const latestSBT =
              updatedWallet.progressionSBTs[
                updatedWallet.progressionSBTs.length - 1
              ];
            setProgressionSBT(latestSBT);
          }

          // For upgraded NFT, we'd need to compare before/after
          // This is simplified for testing
          if (updatedWallet.equippedNFTs.length > 0) {
            // Just grab the first NFT for simplicity
            const nft = updatedWallet.equippedNFTs[0];

            // Create a simulated "before" version by downgrading stats
            const beforeNFT: GameNFT = {
              ...nft,
              tier:
                nft.tier === 'T0'
                  ? 'T0'
                  : nft.tier === 'T1'
                    ? 'T0'
                    : nft.tier === 'T2'
                      ? 'T1'
                      : nft.tier === 'T3'
                        ? 'T2'
                        : nft.tier === 'T4'
                          ? 'T3'
                          : 'T4',
              stats: Object.entries(nft.stats).reduce(
                (newStats, [key, value]) => {
                  newStats[key] = Math.floor(value / 1.3);
                  return newStats;
                },
                {} as Record<string, number>
              ),
            };

            setUpgradedNFT({
              before: beforeNFT,
              after: nft,
            });
          }

          // Show the NFT rewards dialog
          setShowNFTDialog(true);
        }, 2000);
      }
    }
  }, [inBattle, activeCharacter, currentEnemy]);

  // Item weight calculation and over-encumbered check
  const calculateItemWeight = (item: {item: any; rarity: string; type: string; }) => {
    if (!item) return 0;
    const baseWeight =
      {
        weapon: 3,
        armor: 5,
        accessory: 1,
        potion: 0.5,
      }[item.type] || 1;

    const rarityMultiplier =
      {
        common: 1,
        uncommon: 1.2,
        rare: 1.5,
        epic: 2,
        legendary: 3,
      }[item.rarity] || 1;

    return baseWeight * rarityMultiplier;
  };

  const isOverEncumbered = () => {
    if (!activeCharacter) return false;

    const totalInventoryWeight = activeCharacter.inventory.reduce(
      (total, item) => {
        return total + calculateItemWeight(item as any);
      },
      0
    );

    const equippedWeight = Object.values(activeCharacter.equippedItems).reduce(
      (total, item) => {
        return total + calculateItemWeight(item as any);
      },
      0
    );

    const totalWeight = totalInventoryWeight + equippedWeight;
    const maxWeight = 50 + activeCharacter.level * 5;

    return totalWeight > maxWeight * 0.8;
  };

  // Handle enemy turn after player ends their turn
  useEffect(() => {
    if (turn === 'enemy' && inBattle && currentEnemy) {
      // Add a delay for better UX - shorter for faster battles
      const enemyTurnTimeout = setTimeout(() => {
        dispatch({ type: 'ENEMY_ACTION' });
      }, 800); // Reduced from 1000 for faster battles

      return () => clearTimeout(enemyTurnTimeout);
    }
  }, [turn, inBattle, currentEnemy, dispatch]);

  const handleCardPlay = (cardId: string) => {
    if (!inBattle || !activeCharacter || !currentEnemy || turn !== 'player')
      return;

    // Get card information to check for critical hits
    const card = activeCharacter.hand.find((c) => c.id === cardId);

    if (!card) {
      console.error("Attempted to play a card that doesn't exist in hand");
      return;
    }

    if (activeCharacter.currentEnergy < card.energyCost) {
      toast({
        title: 'Not enough energy',
        description: `This card requires ${card.energyCost} energy, but you only have ${activeCharacter.currentEnergy}.`,
        variant: 'destructive',
      });
      return;
    }

    if (card.type === 'attack') {
      // Check for critical hit and pass this info to the reducer
      const criticalHitChance = isOverEncumbered() ? 5 : 15; // Reduced chance if over-encumbered
      const isCriticalHit = Math.random() * 100 < criticalHitChance;

      dispatch({
        type: 'PLAY_CARD',
        payload: {
          cardId,
          isCriticalHit,
        },
      });

      if (isCriticalHit) {
        toast({
          title: 'Critical Hit!',
          description: 'You dealt extra damage with a critical strike!',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Card played',
          description: `${card.name} was played.`,
        });
      }
    } else {
      dispatch({ type: 'PLAY_CARD', payload: { cardId } });

      // Notify the player
      toast({
        title: 'Card played',
        description: `${card.name} was played.`,
      });
    }
  };

  const handleEndTurn = () => {
    if (!inBattle || !activeCharacter || !currentEnemy || turn !== 'player')
      return;

    dispatch({ type: 'END_TURN' });

    // Notify the player
    toast({
      title: 'Turn ended',
      description: "Enemy's turn now.",
    });
  };

  // If not in battle, show appropriate message
  if (!inBattle) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold">Preparing Battle...</h2>
          <p className="text-gray-600">Setting up your next challenge.</p>
        </div>
      </div>
    );
  }

  if (!activeCharacter || !currentEnemy) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold">Loading Battle</h2>
          <p className="text-gray-600">
            Please wait while we prepare your battle.
          </p>
          <Button
            onClick={() => dispatch({ type: 'NAVIGATE', payload: 'map' })}
            className="mt-4"
          >
            Return to Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex h-[calc(100vh-80px)] max-w-5xl flex-col px-2 py-1">
      {/* Warning banner - show only if over-encumbered */}
      {isOverEncumbered() && (
        <div className="mb-2 flex items-center rounded-lg border border-amber-200 bg-amber-50 p-2">
          <AlertCircle className="mr-1 h-4 w-4 text-amber-500" />
          <p className="text-xs text-amber-700">
            Over-encumbered: Critical hit chance reduced, energy regeneration
            limited.
          </p>
        </div>
      )}

      {/* Main battle area - using flex-grow to take available space */}
      <div className="flex flex-grow flex-col space-y-1">
        {/* VS Banner */}
        <div className="mb-1 flex items-center justify-center">
          <div className="flex items-center space-x-2 rounded-full bg-slate-800 px-4 py-1 text-white shadow-lg">
            <span className="text-xs font-bold text-slate-300">
              ROUND {state.battleTurn}
            </span>
            <div className="rounded-full bg-game-primary/80 px-3 py-0.5">
              <span className="flex items-center text-xs font-bold">
                <Swords className="mr-1 h-3 w-3" />
                VS
              </span>
            </div>
          </div>
        </div>

        {/* Combat Area - improved layout for better spacing */}
        <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Player Character - full width on mobile, half on desktop */}
          <div className="animate-slide-in-left">
            <Character
              character={activeCharacter}
              defense={temporaryEffects.playerDefense}
            />
          </div>

          {/* Enemy - full width on mobile, half on desktop */}
          <div className="animate-slide-in-right">
            <Enemy
              enemy={currentEnemy}
              defense={temporaryEffects.enemyDefense}
            />
          </div>

          {/* Turn indicator moved outside the grid for better mobile visibility */}
        </div>

        {/* Who's turn indicator - centered and outside the grid */}
        <div className="mb-2 flex items-center justify-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              turn === 'player'
                ? 'animate-pulse bg-blue-500'
                : 'animate-pulse bg-red-500'
            }`}
          >
            <span className="text-xs font-bold text-white">
              {turn === 'player' ? 'P' : 'E'}
            </span>
          </div>
        </div>

        {/* Battle controls - better positioning with end turn button and energy */}
        <div className="mb-2 flex items-center justify-between px-2">
          <div className="flex-1"></div> {/* Empty space for balance */}
          <div className="flex flex-1 justify-center">
            <Button
              onClick={handleEndTurn}
              disabled={turn !== 'player'}
              className={`game-primary-button relative px-5 ${turn === 'player' ? 'animate-pulse-subtle' : ''}`}
              size="sm"
            >
              {turn === 'player' ? 'End Turn' : 'Enemy Turn'}
              {turn === 'player' && (
                <span className="absolute right-0 top-0 h-2 w-2 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-green-500"></span>
              )}
            </Button>
          </div>
          <div className="flex flex-1 justify-end">
            <EnergyMeter
              current={activeCharacter.currentEnergy}
              max={activeCharacter.maxEnergy}
            />
          </div>
        </div>

        {/* Card Hand - with reduced height */}
        <div className="flex min-h-[150px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100/50 backdrop-blur-md">
          {activeCharacter.hand.length > 0 ? (
            <CardHand
              cards={activeCharacter.hand}
              onCardPlay={handleCardPlay}
              currentEnergy={activeCharacter.currentEnergy}
            />
          ) : (
            <div className="text-center text-slate-500">
              <p>No cards in hand</p>
              {activeCharacter.drawPile.length === 0 &&
                activeCharacter.discardPile.length > 0 && (
                  <Button
                    onClick={() =>
                      dispatch({ type: 'SHUFFLE_DISCARD_TO_DRAW' })
                    }
                    className="mt-2"
                    size="sm"
                  >
                    Shuffle Discard Pile
                  </Button>
                )}
            </div>
          )}
        </div>

        {/* Deck Statistics - more compact */}
        <div className="flex items-center justify-between rounded-lg bg-slate-100/30 px-4 py-1 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Draw:</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5">
              {activeCharacter.drawPile.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Discard:</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5">
              {activeCharacter.discardPile.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Turn:</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5">
              {state.battleTurn}
            </span>
          </div>
        </div>
      </div>

      {/* NFT Rewards Dialog */}
      <Dialog open={showNFTDialog} onOpenChange={setShowNFTDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-amber-500" />
              NFT Rewards
            </DialogTitle>
            <DialogDescription>
              Blockchain rewards for your victory! (Simulation)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* New NFT Reward */}
            {newNFT && (
              <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-slate-50 to-amber-50 p-4">
                <h3 className="mb-2 text-sm font-bold text-amber-700">
                  New NFT Minted:
                </h3>
                <div className="rounded-md bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{newNFT.name}</p>
                      <p className="text-xs text-slate-500">
                        {newNFT.type} • {newNFT.rarity} • {newNFT.tier}
                      </p>
                    </div>
                    <div className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                      NEW
                    </div>
                  </div>

                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <p className="mb-1 text-xs font-semibold text-slate-600">
                      Stats:
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(newNFT.stats).map(([key, value]) => (
                        <div key={key} className="text-xs text-slate-700">
                          {key}: <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progression SBT */}
            {progressionSBT && (
              <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-slate-50 to-blue-50 p-4">
                <h3 className="mb-2 text-sm font-bold text-blue-700">
                  Progression SBT Granted:
                </h3>
                <div className="rounded-md bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-800">
                        Level {progressionSBT.level} Achievement
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(
                          progressionSBT.dateIssued
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      SBT
                    </div>
                  </div>

                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <p className="mb-1 text-xs font-semibold text-slate-600">
                      Achievements:
                    </p>
                    <ul className="list-inside list-disc text-xs text-slate-700">
                      {progressionSBT.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Upgraded NFT */}
            {upgradedNFT && (
              <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-slate-50 to-purple-50 p-4">
                <h3 className="mb-2 text-sm font-bold text-purple-700">
                  NFT Upgraded:
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Before */}
                  <div className="rounded-md bg-white p-3 opacity-60 shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800">
                        {upgradedNFT.before.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {upgradedNFT.before.tier}
                      </p>
                    </div>

                    <div className="mt-2 border-t border-slate-100 pt-2">
                      <p className="mb-1 text-xs font-semibold text-slate-600">
                        Before:
                      </p>
                      <div className="space-y-1">
                        {Object.entries(upgradedNFT.before.stats).map(
                          ([key, value]) => (
                            <div key={key} className="text-xs text-slate-700">
                              {key}:{' '}
                              <span className="font-semibold">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* After */}
                  <div className="rounded-md border-2 border-purple-200 bg-white p-3 shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800">
                        {upgradedNFT.after.name}
                      </p>
                      <div className="flex items-center">
                        <p className="text-xs text-slate-500">
                          {upgradedNFT.after.tier}
                        </p>
                        <div className="ml-2 rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">
                          UPGRADED
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 border-t border-slate-100 pt-2">
                      <p className="mb-1 text-xs font-semibold text-slate-600">
                        After:
                      </p>
                      <div className="space-y-1">
                        {Object.entries(upgradedNFT.after.stats).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between text-xs text-slate-700"
                            >
                              <span>{key}:</span>
                              <span className="flex items-center font-semibold">
                                {value}
                                {value >
                                  (upgradedNFT.before.stats[key] || 0) && (
                                  <span className="ml-1 text-xs text-green-500">
                                    +
                                    {value -
                                      (upgradedNFT.before.stats[key] || 0)}
                                  </span>
                                )}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowNFTDialog(false)}
              className="w-full sm:w-auto"
            >
              Continue Adventure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Battle;
