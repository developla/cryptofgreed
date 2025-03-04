import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Heart,
  Hammer,
  ArrowRight,
  Bed,
  CornerRightUp,
  Trash2,
} from 'lucide-react';
import { Card as CardType } from '@/context/types';
import CardComponent from '@/components/Card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Rest: React.FC = () => {
  const { state, dispatch } = useGame();
  const [showUpgradeSelection, setShowUpgradeSelection] = useState(false);
  const [showRemoveSelection, setShowRemoveSelection] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [upgradedCard, setUpgradedCard] = useState<CardType | null>(null);
  const [cardsRemovedThisRest, setCardsRemovedThisRest] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  if (!state.activeCharacter) {
    return <div>No active character</div>;
  }

  const healAmount = Math.floor(state.activeCharacter.maxHealth * 0.3);
  const isFullHealth =
    state.activeCharacter.currentHealth >= state.activeCharacter.maxHealth;

  // Calculate the cost for removing additional cards
  const getRemovalCost = () => {
    if (cardsRemovedThisRest === 0) return 0; // First removal is free
    return 50 * 2 ** cardsRemovedThisRest; // Exponential cost increase: 50, 100, 200, 400, etc.
  };

  const canRemoveMoreCards = () => {
    if (cardsRemovedThisRest === 0) return true; // Can always remove first card for free
    const removalCost = getRemovalCost();
    return state.activeCharacter && state.activeCharacter.gold >= removalCost;
  };

  const handleHeal = () => {
    dispatch({
      type: 'HEAL_PLAYER',
      payload: { amount: healAmount },
    });

    toast({
      title: 'Rest Complete',
      description: `You've healed ${healAmount} health points.`,
      duration: 3000,
    });

    // Navigate back to map after resting
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE', payload: 'map' });
    }, 1500);
  };

  const handleUpgradeCard = () => {
    setShowUpgradeSelection(true);
    setShowRemoveSelection(false);
  };

  const handleRemoveCard = () => {
    setShowRemoveSelection(true);
    setShowUpgradeSelection(false);
  };

  const handleSelectCardForAction = (card: CardType) => {
    setSelectedCard(card);
  };

  const confirmUpgrade = () => {
    if (selectedCard) {
      // Store a copy of the selected card for showing upgrade info
      setUpgradedCard({ ...selectedCard, upgraded: true });

      // Dispatch the upgrade action
      dispatch({
        type: 'UPGRADE_CARD',
        payload: { cardId: selectedCard.id },
      });

      // Calculate and show the upgrade stats
      const upgradedValue = Math.floor(selectedCard.value * 1.5);
      const upgradeDescription =
        selectedCard.type === 'attack'
          ? `Damage increased from ${selectedCard.value} to ${upgradedValue}`
          : selectedCard.type === 'defense'
            ? `Block increased from ${selectedCard.value} to ${upgradedValue}`
            : `Effect increased from ${selectedCard.value} to ${upgradedValue}`;

      // Show a toast with the upgrade information
      toast({
        title: `${selectedCard.name} Upgraded!`,
        description: upgradeDescription,
        duration: 5000,
      });

      // Navigate back to map after upgrading
      setTimeout(() => {
        dispatch({ type: 'NAVIGATE', payload: 'map' });
      }, 2500);
    }
  };

  const confirmRemove = () => {
    if (selectedCard) {
      const removalCost = getRemovalCost();

      // Show confirmation dialog if removing an additional card with cost
      if (removalCost > 0) {
        setShowConfirmDialog(true);
        return;
      }

      // Otherwise remove for free
      executeCardRemoval();
    }
  };

  const executeCardRemoval = () => {
    if (!selectedCard) return;

    const removalCost = getRemovalCost();

    // If there's a cost, spend the gold
    if (removalCost > 0) {
      dispatch({
        type: 'SPEND_GOLD',
        payload: { amount: removalCost },
      });
    }

    // Remove the card
    dispatch({
      type: 'DISCARD_CARD_FROM_DECK',
      payload: { cardId: selectedCard.id },
    });

    // Increment the counter of removed cards
    setCardsRemovedThisRest((prev) => prev + 1);

    // Show a toast
    toast({
      title: `${selectedCard.name} Removed!`,
      description:
        removalCost > 0
          ? `Paid ${removalCost} gold to remove this card from your deck.`
          : `Card removed from your deck for free.`,
      duration: 3000,
    });

    // Reset selected card
    setSelectedCard(null);
    setShowConfirmDialog(false);

    // If this was the free removal, stay on the screen to potentially remove more
    if (removalCost === 0) {
      return;
    }

    // Otherwise, navigate back to map after paid removal
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE', payload: 'map' });
    }, 2000);
  };

  const handleContinue = () => {
    dispatch({ type: 'NAVIGATE', payload: 'map' });
  };

  // Card removal selection screen
  if (showRemoveSelection) {
    const minimumDeckSize = 10;
    const canRemoveCard = state.activeCharacter.deck.length > minimumDeckSize;
    const removalCost = getRemovalCost();

    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="p-6">
          <h2 className="mb-6 text-center text-2xl font-bold">Remove a Card</h2>

          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowRemoveSelection(false)}
              className="mb-4"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Rest
              Site
            </Button>

            <p className="mb-2 text-center text-slate-600">
              Select a card to remove from your deck permanently.
            </p>

            <p className="mb-6 text-center font-medium">
              {cardsRemovedThisRest === 0
                ? 'First removal is free'
                : `Next removal costs ${removalCost} gold`}
            </p>

            {!canRemoveCard && (
              <div className="mb-6 rounded-md bg-orange-100 p-4 text-center text-orange-800">
                Cannot remove more cards. Minimum deck size is {minimumDeckSize}
                .
              </div>
            )}

            {/* Confirmation Dialog */}
            <Dialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Card Removal</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove {selectedCard?.name} from
                    your deck? This will cost {removalCost} gold and cannot be
                    undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={executeCardRemoval}
                    disabled={state.activeCharacter.gold < removalCost}
                  >
                    Remove Card ({removalCost} gold)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {state.activeCharacter.deck.map((card) => (
                <div
                  key={card.id}
                  className={`relative cursor-pointer ${
                    selectedCard?.id === card.id
                      ? 'rounded-lg ring-2 ring-red-500'
                      : ''
                  }`}
                  onClick={() =>
                    canRemoveCard && handleSelectCardForAction(card)
                  }
                >
                  <CardComponent card={card} />
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={confirmRemove}
                disabled={
                  !selectedCard || !canRemoveCard || !canRemoveMoreCards()
                }
                className="px-8"
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {!canRemoveCard
                  ? 'Cannot Remove (Minimum Deck Size)'
                  : !canRemoveMoreCards()
                    ? `Cannot Afford (${removalCost} gold needed)`
                    : removalCost > 0
                      ? `Remove Card (${removalCost} gold)`
                      : 'Remove Card (Free)'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Card upgrade selection screen
  if (showUpgradeSelection) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="p-6">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Upgrade a Card
          </h2>

          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeSelection(false)}
              className="mb-4"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Rest
              Site
            </Button>

            <p className="mb-6 text-center text-slate-600">
              Select a card to upgrade. Upgraded cards will have improved stats.
            </p>

            {/* Upgraded Card Preview */}
            {upgradedCard && (
              <div
                className="fixed left-0 top-0 z-50 flex h-full w-full animate-fade-in items-center justify-center bg-black/50"
                onClick={() => setUpgradedCard(null)}
              >
                <div className="max-w-md rounded-lg bg-white p-4 text-center">
                  <h3 className="mb-2 text-xl font-bold">Card Upgraded!</h3>
                  <div className="mb-3 flex transform justify-center transition-all hover:scale-110">
                    <CardComponent card={{ ...upgradedCard, upgraded: true }} />
                  </div>
                  <p className="mb-3 text-sm text-gray-600">
                    The card has been upgraded and is now more powerful!
                  </p>
                  <Button onClick={() => setUpgradedCard(null)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {state.activeCharacter.deck.map((card) => (
                <div
                  key={card.id}
                  className={`relative cursor-pointer ${
                    selectedCard?.id === card.id
                      ? 'rounded-lg ring-2 ring-game-primary'
                      : ''
                  } ${card.upgraded ? 'opacity-50' : ''}`}
                  onClick={() =>
                    !card.upgraded && handleSelectCardForAction(card)
                  }
                >
                  <CardComponent card={card} />
                  {card.upgraded && (
                    <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center rounded-lg bg-black/20">
                      <div className="rounded bg-amber-500 px-2 py-1 text-xs text-white">
                        Already Upgraded
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={confirmUpgrade}
                disabled={
                  !selectedCard || (selectedCard && selectedCard.upgraded)
                }
                className="px-8"
              >
                <Hammer className="mr-2 h-4 w-4" />
                {selectedCard && selectedCard.upgraded
                  ? 'Card Already Upgraded'
                  : 'Upgrade Selected Card'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Main rest site screen
  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <Card className="p-6">
        <h2 className="mb-6 text-center text-2xl font-bold">Rest Site</h2>

        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-50 p-8 shadow-md">
              <Bed className="h-24 w-24 text-amber-500" />
            </div>
          </div>

          <p className="text-center text-slate-600">
            You've found a moment to rest. What would you like to do?
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Button
              onClick={handleHeal}
              disabled={isFullHealth}
              className="flex h-auto flex-col items-center py-4"
              variant={isFullHealth ? 'outline' : 'default'}
            >
              <Heart className="mb-2 h-8 w-8" />
              <span className="font-bold">Rest & Heal</span>
              <span className="mt-1 text-sm">
                {isFullHealth
                  ? 'Already at full health'
                  : `Heal ${healAmount} HP`}
              </span>
            </Button>

            <Button
              onClick={handleUpgradeCard}
              className="flex h-auto flex-col items-center py-4"
              variant="outline"
            >
              <Hammer className="mb-2 h-8 w-8" />
              <span className="font-bold">Upgrade a Card</span>
              <span className="mt-1 text-sm">Make one card stronger</span>
            </Button>

            <Button
              onClick={handleRemoveCard}
              className="flex h-auto flex-col items-center py-4"
              variant="outline"
            >
              <Trash2 className="mb-2 h-8 w-8" />
              <span className="font-bold">Remove a Card</span>
              <span className="mt-1 text-sm">
                {cardsRemovedThisRest === 0
                  ? 'First removal is free'
                  : `Costs ${getRemovalCost()} gold`}
              </span>
            </Button>
          </div>

          <div className="pt-4 text-center">
            <Button onClick={handleContinue} className="game-primary-button">
              Continue Journey <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Rest;
