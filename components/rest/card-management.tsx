'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useGameStore } from '@/lib/store/game';
import { CardType, Rarity } from '@prisma/client';
import { Sword, Shield, Zap, Trash2, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';

type ManagementMode = 'REMOVE' | 'UPGRADE';

export function CardManagement() {
  const { currentCharacter, setCharacter } = useGameStore();
  const [mode, setMode] = useState<ManagementMode>('REMOVE');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardAction = async () => {
    if (!currentCharacter || !selectedCard) return;

    setIsProcessing(true);
    try {
      const endpoint = mode === 'REMOVE' ? 'remove' : 'upgrade';
      const response = await fetch(`/api/card/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          characterId: currentCharacter.id,
          cardId: selectedCard,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process card action');
      }

      const { character } = await response.json();
      setCharacter(character);
      toast.success(
        mode === 'REMOVE' ? 'Card removed successfully' : 'Card upgraded successfully'
      );
      setSelectedCard(null);
    } catch (error) {
      console.error('Card action error:', error);
      toast.error('Failed to process card action');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case 'COMMON':
        return 'text-gray-400';
      case 'UNCOMMON':
        return 'text-green-400';
      case 'RARE':
        return 'text-blue-400';
      case 'EPIC':
        return 'text-purple-400';
      case 'LEGENDARY':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getCardTypeIcon = (type: CardType) => {
    switch (type) {
      case 'ATTACK':
        return <Sword className="h-4 w-4 text-red-400" />;
      case 'SKILL':
        return <Shield className="h-4 w-4 text-blue-400" />;
      case 'POWER':
        return <Zap className="h-4 w-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  if (!currentCharacter?.deck) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Card Management</h2>
        <div className="flex gap-2">
          <Button
            variant={mode === 'REMOVE' ? 'default' : 'outline'}
            onClick={() => setMode('REMOVE')}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Remove Card
          </Button>
          <Button
            variant={mode === 'UPGRADE' ? 'default' : 'outline'}
            onClick={() => setMode('UPGRADE')}
            className="gap-2"
          >
            <ArrowUpCircle className="h-4 w-4" />
            Upgrade Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {currentCharacter.deck.map((card) => (
          <Card
            key={card.id}
            className={`cursor-pointer p-4 transition-all ${
              selectedCard === card.id
                ? 'border-primary bg-primary/10'
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedCard(card.id)}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getCardTypeIcon(card.type)}
                <h3 className="font-bold">{card.name}</h3>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-sm">
                {card.energy} Energy
              </span>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {card.description}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className={getRarityColor(card.rarity)}>{card.rarity}</span>
              <span className="text-muted-foreground">{card.type}</span>
            </div>
          </Card>
        ))}
      </div>

      {selectedCard && (
        <Button
          className="w-full"
          onClick={handleCardAction}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </div>
          ) : mode === 'REMOVE' ? (
            'Remove Selected Card'
          ) : (
            'Upgrade Selected Card'
          )}
        </Button>
      )}
    </div>
  );
}