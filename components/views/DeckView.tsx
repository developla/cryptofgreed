'use client';
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Info, Filter } from 'lucide-react';
import CardComponent from '@/components/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type CardFilter = 'all' | 'attack' | 'defense' | 'special' | 'buff' | 'debuff';

const DeckView: React.FC = () => {
  const { state, dispatch } = useGame();
  const { activeCharacter } = state;
  const { toast } = useToast();
  const [filter, setFilter] = useState<CardFilter>('all');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  if (!activeCharacter) return null;

  const handleReturn = () => {
    dispatch({
      type: 'NAVIGATE',
      payload: state.inBattleMode ? 'battle' : 'map',
    });
  };

  const handleSelectCard = (cardId: string) => {
    setSelectedCardId(cardId === selectedCardId ? null : cardId);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value as CardFilter);
  };

  const handleDiscardCard = () => {
    if (selectedCardId) {
      setShowDiscardDialog(true);
    } else {
      toast({
        title: 'No Card Selected',
        description: 'Please select a card to discard first.',
        variant: 'destructive',
      });
    }
  };

  const confirmDiscard = () => {
    if (selectedCardId) {
      console.log('Confirming discard of card:', selectedCardId);
      dispatch({
        type: 'DISCARD_CARD_FROM_DECK',
        payload: { cardId: selectedCardId },
      });

      toast({
        title: 'Card Discarded',
        description: 'The selected card has been removed from your deck.',
      });

      setSelectedCardId(null);
      setShowDiscardDialog(false);
    }
  };

  const filteredCards = activeCharacter.deck.filter((card) => {
    if (filter === 'all') return true;
    return card.type === filter;
  });

  const getCardCountByType = () => {
    const counts = activeCharacter.deck.reduce(
      (acc, card) => {
        acc[card.type] = (acc[card.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return counts;
  };

  const cardCounts = getCardCountByType();

  return (
    <div className="container px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Deck Cards ({activeCharacter.deck.length})</CardTitle>
            <CardDescription>
              Manage your battle deck by discarding unwanted cards
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={handleReturn} size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Return
          </Button>
        </CardHeader>

        <CardContent>
          {/* Deck stats and filter controls */}
          <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-3">
              {Object.entries(cardCounts).map(([type, count]) => (
                <div
                  key={type}
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    type === 'attack'
                      ? 'bg-red-100 text-red-800'
                      : type === 'defense'
                        ? 'bg-blue-100 text-blue-800'
                        : type === 'special'
                          ? 'bg-purple-100 text-purple-800'
                          : type === 'buff'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {type}: {count}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-1 h-4 w-4" />
                    {filter === 'all'
                      ? 'All Cards'
                      : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Cards`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup
                    value={filter}
                    onValueChange={handleFilterChange}
                  >
                    <DropdownMenuRadioItem value="all">
                      All Cards
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="attack">
                      Attack Cards
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="defense">
                      Defense Cards
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="special">
                      Special Cards
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="buff">
                      Buff Cards
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="debuff">
                      Debuff Cards
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleDiscardCard}
                disabled={!selectedCardId || activeCharacter.deck.length <= 10}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Discard Card
              </Button>
            </div>
          </div>

          {activeCharacter.deck.length <= 10 && (
            <div className="mb-4 flex items-start rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <Info className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
              <p>
                You need at least 10 cards in your deck. You cannot discard any
                more cards.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className={`flex justify-center ${
                  selectedCardId === card.id
                    ? 'ring-game-primary rounded-lg ring-2'
                    : ''
                }`}
                onClick={() => handleSelectCard(card.id)}
              >
                <CardComponent card={card} />
              </div>
            ))}
          </div>

          {filteredCards.length === 0 && (
            <div className="py-8 text-center text-slate-500">
              <p>No cards match the current filter.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard this card? This action cannot be
              undone. Discarded cards can only be obtained again as rewards or
              purchases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDiscard}
              className="bg-red-500 hover:bg-red-600"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeckView;
