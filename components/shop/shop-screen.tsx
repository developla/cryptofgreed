'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useGameStore } from '@/lib/store/game';
import { CardType, Rarity } from '@prisma/client';
import { Sword, Shield, Zap, Coins, FlaskRound as Flask, Trash2, Tag, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { SHOP_ITEMS, type ShopItem, getSpecialDiscounts } from '@/lib/game/shop';

export function ShopScreen() {
  const router = useRouter();
  const { currentCharacter, setCharacter } = useGameStore();
  const [selectedTab, setSelectedTab] = useState('cards');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [discounts, setDiscounts] = useState<Record<string, number>>({});
  const [specialEvent, setSpecialEvent] = useState<{
    active: boolean;
    name: string;
    description: string;
    expiresIn: number;
  }>({
    active: false,
    name: '',
    description: '',
    expiresIn: 0,
  });

  useEffect(() => {
    if (currentCharacter) {
      // Generate discounts based on character class
      const newDiscounts = getSpecialDiscounts(currentCharacter.class);
      setDiscounts(newDiscounts);

      // 30% chance of special event
      if (Math.random() < 0.3) {
        const events = [
          {
            name: "Merchant's Festival",
            description: "It's a special shopping day! All items are 15% off.",
            discount: 15,
          },
          {
            name: "Rare Collection",
            description: "The merchant has rare items in stock today! Rare and Epic cards are 20% off.",
            rarityDiscount: true,
          },
          {
            name: "Clearance Sale",
            description: "The merchant is clearing inventory! Random items have massive discounts.",
            randomDiscount: true,
          },
        ];

        const selectedEvent = events[Math.floor(Math.random() * events.length)];
        
        // Apply event effects
        let updatedDiscounts = { ...newDiscounts };
        
        if (selectedEvent.discount) {
          // Apply flat discount to all items
          SHOP_ITEMS.cards.forEach(item => {
            updatedDiscounts[item.id] = (updatedDiscounts[item.id] || 0) + selectedEvent.discount!;
          });
          SHOP_ITEMS.consumables.forEach(item => {
            updatedDiscounts[item.id] = (updatedDiscounts[item.id] || 0) + selectedEvent.discount!;
          });
        } else if (selectedEvent.rarityDiscount) {
          // Apply discount to rare/epic items
          SHOP_ITEMS.cards.forEach(item => {
            if (item.rarity === 'RARE' || item.rarity === 'EPIC') {
              updatedDiscounts[item.id] = (updatedDiscounts[item.id] || 0) + 20;
            }
          });
        } else if (selectedEvent.randomDiscount) {
          // Apply big discounts to random items
          const allItems = [...SHOP_ITEMS.cards, ...SHOP_ITEMS.consumables];
          const luckyItems = allItems
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
            
          luckyItems.forEach(item => {
            updatedDiscounts[item.id] = (updatedDiscounts[item.id] || 0) + Math.floor(Math.random() * 30) + 20; // 20-50% discount
          });
        }
        
        setDiscounts(updatedDiscounts);
        setSpecialEvent({
          active: true,
          name: selectedEvent.name,
          description: selectedEvent.description,
          expiresIn: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
        });
      }
    }
  }, [currentCharacter]);

  const getDiscountedPrice = (item: ShopItem) => {
    const discount = discounts[item.id] || 0;
    if (discount === 0) return item.cost;
    
    return Math.floor(item.cost * (1 - discount / 100));
  };

  const getRarityColor = (rarity: Rarity | string) => {
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

  const getCardTypeIcon = (type: CardType | string) => {
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

  const handlePurchase = async (item: ShopItem) => {
    if (!currentCharacter) {
      toast.error('No character selected');
      return;
    }

    const price = getDiscountedPrice(item);
    if (currentCharacter.gold < price) {
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
          price: price, // Send discounted price
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

  const handleRemoveCard = async (cardId: string) => {
    if (!currentCharacter || !currentCharacter.deck) return;

    const REMOVAL_COST = 100;

    if (currentCharacter.gold < REMOVAL_COST) {
      toast.error('Not enough gold!');
      return;
    }

    try {
      setIsPurchasing(true);

      const response = await fetch('/api/shop/remove-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          characterId: currentCharacter.id,
          cardId,
          cost: REMOVAL_COST,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove card');
      }

      const { character } = await response.json();
      setCharacter(character);
      toast.success('Card removed successfully!');
    } catch (error) {
      console.error('Card removal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove card');
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
          <div>
            <h1 className="text-3xl font-bold">Merchant</h1>
            <p className="text-sm text-muted-foreground">
              Buy cards, consumables, or remove cards from your deck
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-400" />
              <span className="text-lg font-bold">{currentCharacter.gold}</span>
            </div>
            <Button onClick={handleExit}>Leave Shop</Button>
          </div>
        </div>

        {specialEvent.active && (
          <Card className="mb-6 border-2 border-yellow-500/50 bg-yellow-500/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-6 w-6 text-yellow-500" />
                <div>
                  <h3 className="font-bold text-yellow-500">{specialEvent.name}</h3>
                  <p className="text-sm text-muted-foreground">{specialEvent.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Expires in {specialEvent.expiresIn} minutes</span>
              </div>
            </div>
          </Card>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="cards" className="gap-2">
              <Sword className="h-4 w-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="consumables" className="gap-2">
              <Flask className="h-4 w-4" />
              Consumables
            </TabsTrigger>
            <TabsTrigger value="remove" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Remove Cards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cards">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {SHOP_ITEMS.cards.map((item) => {
                const discountedPrice = getDiscountedPrice(item);
                const hasDiscount = discounts[item.id] > 0;
                
                return (
                  <Card key={item.id} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCardTypeIcon(item.cardType || 'SKILL')}
                        <h3 className="font-bold">{item.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        {hasDiscount && (
                          <span className="mr-1 text-xs line-through opacity-70">
                            {item.cost}
                          </span>
                        )}
                        <Coins className="h-4 w-4" />
                        <span className={hasDiscount ? "text-green-400" : ""}>
                          {discountedPrice}
                        </span>
                        {hasDiscount && (
                          <span className="ml-1 rounded-full bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400">
                            -{discounts[item.id]}%
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={getRarityColor(item.rarity || 'COMMON')}>
                        {item.rarity}
                      </span>
                      <Button
                        size="sm"
                        disabled={
                          isPurchasing || currentCharacter.gold < discountedPrice
                        }
                        onClick={() => handlePurchase(item)}
                      >
                        Purchase
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="consumables">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {SHOP_ITEMS.consumables.map((item) => {
                const discountedPrice = getDiscountedPrice(item);
                const hasDiscount = discounts[item.id] > 0;
                
                return (
                  <Card key={item.id} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flask className="h-4 w-4 text-purple-400" />
                        <h3 className="font-bold">{item.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        {hasDiscount && (
                          <span className="mr-1 text-xs line-through opacity-70">
                            {item.cost}
                          </span>
                        )}
                        <Coins className="h-4 w-4" />
                        <span className={hasDiscount ? "text-green-400" : ""}>
                          {discountedPrice}
                        </span>
                        {hasDiscount && (
                          <span className="ml-1 rounded-full bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400">
                            -{discounts[item.id]}%
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        disabled={
                          isPurchasing || currentCharacter.gold < discountedPrice
                        }
                        onClick={() => handlePurchase(item)}
                      >
                        Purchase
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="remove">
            <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <h3 className="mb-2 font-bold text-destructive">Card Removal</h3>
              <p className="text-sm text-muted-foreground">
                Remove unwanted cards from your deck for 100 gold each
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {currentCharacter.deck && currentCharacter.deck.map((card) => (
                <Card key={card.id} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCardTypeIcon(card.type)}
                      <h3 className="font-bold">{card.name}</h3>
                    </div>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Coins className="h-4 w-4" />
                      100
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {card.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={getRarityColor(card.rarity)}>
                      {card.rarity}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={
                        isPurchasing || currentCharacter.gold < 100
                      }
                      onClick={() => handleRemoveCard(card.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}