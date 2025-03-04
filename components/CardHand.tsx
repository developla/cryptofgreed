import React from 'react';
import Card from './Card';
import { Card as CardType } from '@/context/GameContext';

interface CardHandProps {
  cards: CardType[];
  onCardPlay: (cardId: string) => void;
  currentEnergy: number;
}

const CardHand: React.FC<CardHandProps> = ({
  cards,
  onCardPlay,
  currentEnergy,
}) => {
  // Handler for when a card is clicked
  const handleCardClick = (cardId: string, isDisabled: boolean) => {
    if (!isDisabled) {
      console.log('Card clicked in CardHand component:', cardId);
      onCardPlay(cardId);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300">
        <p className="text-slate-400">No cards in hand</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Added scrollable container with proper overflow handling */}
      <div className="scrollbar-hide flex max-w-full items-end justify-center overflow-x-auto px-2 py-4">
        <div className="flex min-w-min items-end justify-center space-x-[-40px]">
          {cards.map((card, index) => {
            const isDisabled = card.energyCost > currentEnergy;
            // Adjust card rotation and positioning for a more compact layout
            const rotationDeg = (index - (cards.length - 1) / 2) * 4;
            const translateY = Math.abs(rotationDeg) * 0.3;

            return (
              <div
                key={card.id}
                className="transform transition-all duration-300 hover:z-10 hover:translate-y-[-15px]"
                style={{
                  transform: `rotate(${rotationDeg}deg) translateY(${translateY}px)`,
                  zIndex: index,
                }}
              >
                <Card
                  card={card}
                  onClick={() => handleCardClick(card.id, isDisabled)}
                  disabled={isDisabled}
                  className="scale-85" // Scale down cards slightly more
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CardHand;
