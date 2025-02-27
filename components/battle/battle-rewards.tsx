'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useGameStore } from '@/lib/store/game';
import { CardType, Rarity } from '@prisma/client';
import { Sword, Shield, Zap, Coins, Star, FlaskRound as Flask } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BattleRewardsProps {
  rewards: {
    gold: number;
    experience: number;
    cards: CardReward[];
    consumables: ConsumableReward[];
  };
  onComplete: () => void;
}

interface CardReward {
  name: string;
  description: string;
  type: CardType;
  rarity: Rarity;
  energy: number;
  damage?: number;
  block?: number;
  effects?: any[];
}

interface ConsumableReward {
  name: string;
  description: string;
  type: string; // Changed from ConsumableType to string
  value: number;
  duration?: number;
  quantity: number;
}

export function BattleRewards({ rewards, onComplete }: BattleRewardsProps) {
  const router = useRouter();
  const { currentCharacter, setCharacter } = useGameStore();
  const [selectedCard, setSelectedCard] = useState<CardReward | null>(null);
  const [selectedConsumables, setSelectedConsumables] = useState<ConsumableReward[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);

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

  const handleConsumableToggle = (consumable: ConsumableReward) => {
    setSelectedConsumables((prev) => {
      const isSelected = prev.find((c) => c.name === consumable.name);
      if (isSelected) {
        return prev.filter((c) => c.name !== consumable.name);
      }
      return [...prev, consumable];
    });
  };

  const handleCollectRewards = async () => {
    if (!currentCharacter) return;

    setIsCollecting(true);
    try {
      const response = await fetch('/api/battle/collect-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          characterId: currentCharacter.id,
          rewards: {
            gold: rewards.gold,
            experience: rewards.experience,
            card: selectedCard,
            consumables: selectedConsumables,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to collect rewards');
      }

      const { character } = await response.json();
      setCharacter(character);
      toast.success('Rewards collected successfully!');
      onComplete();
      router.push('/map');
    } catch (error) {
      console.error('Failed to collect rewards:', error);
      toast.error('Failed to collect rewards');
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Victory Rewards</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span className="text-lg font-bold">{rewards.gold}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-400" />
            <span className="text-lg font-bold">{rewards.experience} XP</span>
          </div>
        </div>
      </div>

      {rewards.cards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Choose a Card</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {rewards.cards.map((card, index) => (
              <Card
                key={index}
                className={`cursor-pointer p-4 transition-all ${
                  selectedCard?.name === card.name
                    ? 'border-primary bg-primary/10'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedCard(card)}
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
        </div>
      )}

      {rewards.consumables.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Select Consumables</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {rewards.consumables.map((consumable, index) => (
              <Card
                key={index}
                className={`cursor-pointer p-4 transition-all ${
                  selectedConsumables.find((c) => c.name === consumable.name)
                    ? 'border-primary bg-primary/10'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleConsumableToggle(consumable)}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Flask className="h-5 w-5 text-purple-400" />
                  <div>
                    <h3 className="font-bold">{consumable.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {consumable.quantity}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {consumable.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleCollectRewards}
        disabled={isCollecting || (rewards.cards.length > 0 && !selectedCard)}
      >
        {isCollecting ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Collecting Rewards...
          </div>
        ) : (
          'Collect Rewards'
        )}
      </Button>
    </div>
  );
}