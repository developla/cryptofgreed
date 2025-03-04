import React from 'react';
import { EquipmentShopItem } from '@/context/types';
import ShopItem from './ShopItem';
import { useGame } from '@/context/GameContext';

interface EquipmentShopTabProps {
  items: EquipmentShopItem[];
}

const EquipmentShopTab: React.FC<EquipmentShopTabProps> = ({ items }) => {
  const { state, dispatch } = useGame();

  const handleBuyEquipment = (equipment: EquipmentShopItem) => {
    if (state.activeCharacter && state.activeCharacter.gold >= equipment.cost) {
      dispatch({
        type: 'BUY_EQUIPMENT',
        payload: {
          equipment: {
            id: equipment.id,
            name: equipment.name,
            type: equipment.slot,
            description: equipment.description,
            value: equipment.statBonus.value,
            rarity: equipment.rarity,
            weight:
              equipment.slot === 'weapon'
                ? 3
                : equipment.slot === 'armor'
                  ? 5
                  : 2, // Different weights based on equipment type
          },
          cost: equipment.cost,
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
          onBuy={() => handleBuyEquipment(item)}
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

export default EquipmentShopTab;
