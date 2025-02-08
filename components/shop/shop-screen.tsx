'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useGameStore } from '@/lib/store/game';
import { CardType, Rarity } from '@prisma/client';
import { toast } from 'sonner';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'CARD' | 'EQUIPMENT';
  cost: number;
  rarity: Rarity;
  cardType?: CardType;
  equipmentSlot?: string;
}

const MOCK_SHOP_ITEMS: ShopItem[] = [
  {
    id: '1',
    name: 'Heavy Strike',
    description: 'Deal 12 damage',
    type: 'CARD',
    cardType: 'ATTACK',
    cost: 100,
    rarity: 'UNCOMMON',
  },
  {
    id: '2',
    name: 'Iron Helmet',
    description: '+5 Max HP',
    type: 'EQUIPMENT',
    equipmentSlot: 'HEAD',
    cost: 150,
    rarity: 'COMMON',
  },
];

export function ShopScreen() {
  const router = useRouter();
  const { currentCharacter, setCharacter } = useGameStore();
  const [items] = useState<ShopItem[]>(MOCK_SHOP_ITEMS);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async (item: ShopItem) => {
    if (!currentCharacter) {
      toast.error('No character selected');
      return;
    }

    if (currentCharacter.gold < item.cost) {
      toast.error('Not enough gold!');
      return;
    }

    try {
      setIsPurchasing(true);

      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          characterId: currentCharacter.id,
          itemId: item.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to purchase item');
      }

      const { character } = await response.json();
      setCharacter(character);
      toast.success('Item purchased successfully!');
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to purchase item');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleExit = () => {
    router.push('/map');
  };

  if (!currentCharacter) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Merchant</h1>
          <div className="flex items-center gap-4">
            <p className="text-lg">Gold: {currentCharacter.gold}</p>
            <Button onClick={handleExit}>Leave Shop</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <span className="text-yellow-500">{item.cost} Gold</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="rounded bg-primary/20 px-2 py-1 text-xs">
                    {item.type}
                  </span>
                  <span className="rounded bg-primary/20 px-2 py-1 text-xs">
                    {item.rarity}
                  </span>
                </div>
                <Button
                  size="sm"
                  disabled={currentCharacter.gold < item.cost || isPurchasing}
                  onClick={() => handlePurchase(item)}
                >
                  {isPurchasing ? 'Purchasing...' : 'Purchase'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}