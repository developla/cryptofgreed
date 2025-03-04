import React from 'react';
import { PotionShopItem } from '@/context/types';
import ShopItem from './ShopItem';
import { useGame } from '@/context/GameContext';

interface PotionShopTabProps {
  items: PotionShopItem[];
}

const PotionShopTab: React.FC<PotionShopTabProps> = ({ items }) => {
  const { state, dispatch } = useGame();

  const handleBuyPotion = (potion: PotionShopItem) => {
    if (state.activeCharacter && state.activeCharacter.gold >= potion.cost) {
      dispatch({
        type: 'BUY_POTION',
        payload: {
          potion: {
            id: potion.id,
            name: potion.name,
            type: 'potion',
            description: potion.description,
            value: potion.value,
            rarity: potion.rarity,
            weight: 1, // Default weight for potions
          },
          cost: potion.cost,
        },
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ShopItem
          key={item.id}
          item={item}
          onBuy={() => handleBuyPotion(item)}
          canAfford={
            state.activeCharacter
              ? state.activeCharacter.gold >= item.cost
              : false
          }
        />
      ))}
    </div>
  );
};

export default PotionShopTab;
