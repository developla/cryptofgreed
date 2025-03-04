import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShopItem as ShopItemType } from '@/context/types';

interface ShopItemProps {
  item: ShopItemType;
  onBuy: () => void;
  canAfford: boolean;
}

const rarityColors = {
  common: 'bg-slate-200 text-slate-700',
  uncommon: 'bg-green-200 text-green-700',
  rare: 'bg-blue-200 text-blue-700',
  epic: 'bg-purple-200 text-purple-700',
  legendary: 'bg-amber-200 text-amber-700',
};

const ShopItem: React.FC<ShopItemProps> = ({ item, onBuy, canAfford }) => {
  return (
    <Card className="flex h-full flex-col overflow-hidden border border-slate-200 shadow-sm">
      <CardContent className="flex-grow p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <Badge className={rarityColors[item.rarity]}>
            {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
          </Badge>
        </div>

        <p className="mb-2 text-sm text-slate-600">{item.description}</p>

        {item.type === 'card' && (
          <div className="text-sm">
            <p className="text-amber-600">Energy Cost: {item.energyCost}</p>
            <p>Value: {item.value}</p>
            <p>Type: {item.cardType}</p>
          </div>
        )}

        {item.type === 'potion' && (
          <div className="text-sm">
            <p>Effect: {item.effect}</p>
            <p>Value: {item.value}</p>
          </div>
        )}

        {item.type === 'equipment' && (
          <div className="text-sm">
            <p>Slot: {item.slot}</p>
            <p>
              {item.statBonus.type}: +{item.statBonus.value}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto border-t border-slate-100 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <p className="font-medium text-amber-600">{item.cost} Gold</p>
          <Button
            onClick={onBuy}
            disabled={!canAfford}
            variant={canAfford ? 'default' : 'outline'}
            size="sm"
          >
            {canAfford ? 'Buy' : 'Cannot Afford'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ShopItem;
