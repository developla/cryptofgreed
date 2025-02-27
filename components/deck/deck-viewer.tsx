'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useGameStore } from '@/lib/store/game';
import { CardType, Rarity } from '@prisma/client';
import { Sword, Shield, Zap } from 'lucide-react';

interface DeckViewerProps {
  showPlayedCards?: boolean;
}

export function DeckViewer({ showPlayedCards = false }: DeckViewerProps) {
  const { playerDeck, playerDiscardPile, currentCharacter } = useGameStore();
  const [view, setView] = useState<'deck' | 'played'>('deck');

  const cards = view === 'deck' ? playerDeck : playerDiscardPile;

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

  if (!currentCharacter) return null;

  return (
    <div className="space-y-4">
      {showPlayedCards && (
        <div className="flex gap-2">
          <Button
            variant={view === 'deck' ? 'default' : 'outline'}
            onClick={() => setView('deck')}
          >
            Deck ({playerDeck.length})
          </Button>
          <Button
            variant={view === 'played' ? 'default' : 'outline'}
            onClick={() => setView('played')}
          >
            Played ({playerDiscardPile.length})
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index} className="p-4">
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
    </div>
  );
}