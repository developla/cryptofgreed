import React from 'react';
import { CardShopItem } from '@/context/types';
import ShopItem from './ShopItem';
import { useGame } from '@/context/GameContext';

interface CardShopTabProps {
  items: CardShopItem[];
}

const CardShopTab: React.FC<CardShopTabProps> = ({ items }) => {
  const { state, dispatch } = useGame();

  const handleBuyCard = (card: CardShopItem) => {
    if (state.activeCharacter && state.activeCharacter.gold >= card.cost) {
      dispatch({
        type: 'BUY_CARD',
        payload: {
          card: {
            id: card.id,
            name: card.name,
            type: card.cardType,
            description: card.description,
            energyCost: card.energyCost,
            value: card.value,
            rarity: card.rarity,
          },
          cost: card.cost,
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
          onBuy={() => handleBuyCard(item)}
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

export default CardShopTab;
