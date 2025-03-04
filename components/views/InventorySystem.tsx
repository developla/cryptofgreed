'use client';
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  FlaskConical,
  ShieldAlert,
  Weight,
  Sword,
  Shield,
  Coffee,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Item } from '@/context/types';
import { calculateItemWeight } from '@/context/gameUtils';
import { cn } from '@/lib/utils';

const InventorySystem: React.FC = () => {
  const { state, dispatch } = useGame();
  const { activeCharacter, inBattleMode } = state;
  const [selectedTab, setSelectedTab] = useState('all');

  if (!activeCharacter) return null;

  const handleReturn = () => {
    dispatch({ type: 'NAVIGATE', payload: inBattleMode ? 'battle' : 'map' });
  };

  // Calculate weight information
  const totalInventoryWeight = activeCharacter.inventory.reduce(
    (total, item) => {
      return total + calculateItemWeight(item);
    },
    0
  );

  const equippedWeight = Object.values(activeCharacter.equippedItems).reduce(
    (total, item) => {
      return total + calculateItemWeight(item);
    },
    0
  );

  const totalWeight = totalInventoryWeight + equippedWeight;
  const maxWeight = 50 + activeCharacter.level * 5;
  const weightPercentage = (totalWeight / maxWeight) * 100;
  const isOverEncumbered = weightPercentage > 80;

  const handleUseItem = (item: Item) => {
    if (item.type === 'potion') {
      dispatch({
        type: 'USE_POTION',
        payload: { potionId: item.id },
      });
      toast({
        title: 'Item Used',
        description: `Used ${item.name}: ${item.description}`,
      });
    }
  };

  const handleEquipItem = (item: Item) => {
    dispatch({ type: 'EQUIP_ITEM', payload: item });
    toast({
      title: 'Item Equipped',
      description: `${item.name} has been equipped.`,
    });
  };

  const handleUnequipItem = (slot: 'weapon' | 'armor' | 'accessory') => {
    dispatch({ type: 'UNEQUIP_ITEM', payload: slot });
    toast({
      title: 'Item Unequipped',
      description: `Item has been unequipped from ${slot} slot.`,
    });
  };

  const renderItemCard = (item: Item, isEquipped: boolean = false) => {
    const itemIcons = {
      weapon: <Sword className="text-game-attack h-4 w-4" />,
      armor: <Shield className="text-game-defense h-4 w-4" />,
      accessory: <Coffee className="h-4 w-4 text-amber-500" />,
      potion: <FlaskConical className="h-4 w-4 text-blue-500" />,
    };

    return (
      <Card
        key={item.id}
        className={cn(
          'p-3 transition-all',
          isEquipped
            ? 'border-game-primary border-2 bg-primary/5'
            : 'border border-slate-200',
          item.type === 'potion'
            ? 'bg-blue-50/50'
            : item.type === 'weapon'
              ? 'bg-red-50/50'
              : item.type === 'armor'
                ? 'bg-slate-50/50'
                : 'bg-amber-50/50'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              {itemIcons[item.type]}
              <h4 className="font-medium">{item.name}</h4>
            </div>
            <p className="mb-1 text-sm text-slate-600">{item.description}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Weight: {calculateItemWeight(item).toFixed(1)}</span>
              <span>•</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5',
                  item.rarity === 'common'
                    ? 'bg-slate-100'
                    : item.rarity === 'uncommon'
                      ? 'bg-green-100 text-green-700'
                      : item.rarity === 'rare'
                        ? 'bg-blue-100 text-blue-700'
                        : item.rarity === 'epic'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                )}
              >
                {item.rarity}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {item.type === 'potion' ? (
              <Button
                size="sm"
                onClick={() => handleUseItem(item)}
                disabled={state.inBattleMode && state.turn === 'enemy'}
              >
                Use
              </Button>
            ) : isEquipped ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleUnequipItem(
                    item.type as 'weapon' | 'armor' | 'accessory'
                  )
                }
              >
                Unequip
              </Button>
            ) : (
              <Button size="sm" onClick={() => handleEquipItem(item)}>
                Equip
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Filter items based on selected tab
  const filterItems = () => {
    const allItems = [...activeCharacter.inventory];
    switch (selectedTab) {
      case 'equipment':
        return allItems.filter(
          (item) =>
            item.type === 'weapon' ||
            item.type === 'armor' ||
            item.type === 'accessory'
        );
      case 'potions':
        return allItems.filter((item) => item.type === 'potion');
      default:
        return allItems;
    }
  };

  const equippedItems = Object.entries(activeCharacter.equippedItems).map(
    ([slot, item]) => ({
      slot,
      item,
    })
  );

  return (
    <div className="container px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Inventory</CardTitle>
          <Button variant="ghost" onClick={handleReturn} size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {inBattleMode ? 'Return to Battle' : 'Return to Map'}
          </Button>
        </CardHeader>

        <CardContent>
          {/* Weight Management UI */}
          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center">
                <Weight className="mr-2 h-5 w-5 text-slate-600" />
                <h3 className="font-medium">Carry Weight</h3>
              </div>
              <span
                className={`text-sm font-medium ${isOverEncumbered ? 'text-red-500' : 'text-slate-600'}`}
              >
                {totalWeight.toFixed(1)} / {maxWeight} units
              </span>
            </div>

            <Progress
              value={weightPercentage}
              className={cn(
                'h-2',
                weightPercentage > 90
                  ? '[&>div]:bg-red-500'
                  : weightPercentage > 70
                    ? '[&>div]:bg-yellow-500'
                    : '[&>div]:bg-green-500'
              )}
            />

            {isOverEncumbered && (
              <div className="mt-2 flex items-center text-sm text-red-500">
                <ShieldAlert className="mr-1 h-4 w-4" />
                <span>Over-encumbered! Combat abilities are reduced.</span>
              </div>
            )}
          </div>

          {/* Equipped Items Section */}
          <div className="mb-6">
            <h3 className="mb-3 font-medium">Equipped Items</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {equippedItems.map(({ slot, item }) =>
                item ? (
                  renderItemCard(item, true)
                ) : (
                  <Card
                    key={slot}
                    className="border-2 border-dashed border-slate-200 p-4"
                  >
                    <div className="text-center text-slate-500">
                      <span className="capitalize">{slot}</span> slot empty
                    </div>
                  </Card>
                )
              )}
            </div>
          </div>

          {/* Inventory Tabs */}
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={setSelectedTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="potions">Potions</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-0">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterItems().map((item) => renderItemCard(item))}
              </div>

              {filterItems().length === 0 && (
                <div className="rounded-lg bg-slate-50 py-8 text-center">
                  <p className="text-slate-500">No items in this category</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="border-t pt-4 text-sm text-slate-500">
          <p>
            Manage your inventory carefully. Being over-encumbered will reduce
            your combat effectiveness.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InventorySystem;
