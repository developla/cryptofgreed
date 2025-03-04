import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CardShopTab from './shop/CardShopTab';
import PotionShopTab from './shop/PotionShopTab';
import EquipmentShopTab from './shop/EquipmentShopTab';
import { ShopItem, CardShopItem, PotionShopItem, EquipmentShopItem } from '@/context/types';

const Shop: React.FC = () => {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);

  // Type guard functions
  const isCardShopItem = (item: ShopItem): item is CardShopItem => item.type === 'card';
  const isPotionShopItem = (item: ShopItem): item is PotionShopItem => item.type === 'potion';
  const isEquipmentShopItem = (item: ShopItem): item is EquipmentShopItem => item.type === 'equipment';

  // Generate shop items on component mount
  useEffect(() => {
    generateShopItems();
  }, []);

  // Function to generate shop items
  const generateShopItems = () => {
    // Mock data for shop items
    const items: ShopItem[] = [
      // Cards
      {
        id: 'card1',
        type: 'card',
        name: 'Firebolt',
        description: 'Deal 8 damage to an enemy.',
        cost: 50,
        rarity: 'uncommon',
        cardType: 'attack',
        value: 8,
        energyCost: 1,
      },
      {
        id: 'card2',
        type: 'card',
        name: 'Ice Shield',
        description: 'Gain 10 defense.',
        cost: 45,
        rarity: 'common',
        cardType: 'defense',
        value: 10,
        energyCost: 1,
      },
      {
        id: 'card3',
        type: 'card',
        name: 'Arcane Blast',
        description: 'Deal 15 damage to an enemy.',
        cost: 75,
        rarity: 'rare',
        cardType: 'attack',
        value: 15,
        energyCost: 2,
      },
      // Potions
      {
        id: 'potion1',
        type: 'potion',
        name: 'Health Potion',
        description: 'Restore 20 health.',
        cost: 30,
        rarity: 'common',
        value: 20,
        effect: 'heal',
      },
      {
        id: 'potion2',
        type: 'potion',
        name: 'Energy Elixir',
        description: 'Restore 2 energy during battle.',
        cost: 40,
        rarity: 'uncommon',
        value: 2,
        effect: 'energy',
      },
      {
        id: 'potion3',
        type: 'potion',
        name: 'Strength Potion',
        description: 'Increase damage by 3 for your next 3 attacks.',
        cost: 60,
        rarity: 'rare',
        value: 3,
        effect: 'strength',
      },
      // Equipment
      {
        id: 'equipment1',
        type: 'equipment',
        name: 'Iron Sword',
        description: 'A basic sword that increases your attack damage.',
        cost: 100,
        rarity: 'common',
        slot: 'weapon',
        statBonus: {
          type: 'attack',
          value: 5,
        },
      },
      {
        id: 'equipment2',
        type: 'equipment',
        name: 'Leather Armor',
        description: 'Basic armor that provides some protection.',
        cost: 120,
        rarity: 'common',
        slot: 'armor',
        statBonus: {
          type: 'defense',
          value: 7,
        },
      },
      {
        id: 'equipment3',
        type: 'equipment',
        name: 'Amulet of Vitality',
        description: 'Increases your maximum health.',
        cost: 150,
        rarity: 'uncommon',
        slot: 'accessory',
        statBonus: {
          type: 'health',
          value: 15,
        },
      },
    ];

    setShopItems(items);
  };

  // Return to the map
  const handleReturn = () => {
    dispatch({ type: 'NAVIGATE', payload: 'map' });
  };

  // Filter shop items by type using type guards
  const cardItems = shopItems.filter(isCardShopItem);
  const potionItems = shopItems.filter(isPotionShopItem);
  const equipmentItems = shopItems.filter(isEquipmentShopItem);

  return (
    <div className="container mx-auto p-4">
      <Card className="overflow-hidden rounded-lg border border-slate-200 shadow-md">
        <div className="bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Merchant's Shop
            </h2>
            <div>
              <span className="mr-2 font-medium text-amber-600">
                Your Gold: {state.activeCharacter?.gold || 0}
              </span>
              <Button variant="outline" onClick={handleReturn}>
                Return to Map
              </Button>
            </div>
          </div>

          <Tabs defaultValue="cards">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="potions">Potions</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
            </TabsList>

            <TabsContent value="cards">
              <CardShopTab items={cardItems} />
            </TabsContent>

            <TabsContent value="potions">
              <PotionShopTab items={potionItems} />
            </TabsContent>

            <TabsContent value="equipment">
              <EquipmentShopTab items={equipmentItems} />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default Shop;
