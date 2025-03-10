import React from 'react';
import { Card as CardType } from '@/context/GameContext';
import { Shield, Sword, Zap, Flame, Focus, CornerRightUp } from 'lucide-react';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  card,
  onClick,
  disabled = false,
  className = '',
}) => {
  // Determine card color based on type
  const getCardColor = () => {
    switch (card.type) {
      case 'attack':
        return 'border-game-attack/30 bg-game-attack/5';
      case 'defense':
        return 'border-game-defense/30 bg-game-defense/5';
      case 'special':
        return 'border-game-accent/30 bg-game-accent/5';
      case 'buff':
        return 'border-green-400/30 bg-green-400/5';
      case 'debuff':
        return 'border-purple-400/30 bg-purple-400/5';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getCardIcon = () => {
    switch (card.type) {
      case 'attack':
        return <Sword className="h-5 w-5 text-game-attack" />;
      case 'defense':
        return <Shield className="h-5 w-5 text-game-defense" />;
      case 'special':
        return <Zap className="h-5 w-5 text-game-accent" />;
      case 'buff':
        return <Flame className="h-5 w-5 text-green-400" />;
      case 'debuff':
        return <Focus className="h-5 w-5 text-purple-400" />;
      default:
        return null;
    }
  };

  const getRarityClass = () => {
    switch (card.rarity) {
      case 'common':
        return '';
      case 'uncommon':
        return 'before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-blue-300/30';
      case 'rare':
        return 'before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-purple-300/30';
      case 'epic':
        return 'before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-orange-300/30';
      case 'legendary':
        return 'before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-yellow-300/30 before:shadow-[0_0_15px_rgba(255,215,0,0.3)]';
      default:
        return '';
    }
  };

  return (
    <div
      className={`game-card ${getCardColor()} ${getRarityClass()} ${className} ${
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer hover:scale-80'
      } group relative flex h-[200px] w-[150px] flex-col overflow-hidden transition-all duration-300 ease-in-out`}
      onClick={!disabled ? onClick : undefined}
    >
      {/* Card Cost */}
      <div className="absolute left-2 top-2 bottom-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-game-energy font-bold text-white">
        <span className="text-xs">{card.energyCost}</span>
      </div>

      {/* Upgraded Badge */}
      {card.upgraded && (
        <div className="absolute right-2 top-2 z-10 flex items-center justify-center rounded-sm bg-amber-500 px-1 py-0.5 text-xs font-bold text-white">
          <CornerRightUp className="mr-0.5 h-3 w-3" />
          <span>+</span>
        </div>
      )}

      {/* Card Header */}
      <div className="flex justify-self-end justify-end items-end border-b border-slate-200 bg-white/90 px-3 py-2 backdrop-blur-sm">
        <div className="text-slate-700 justify-self-end">{getCardIcon()}</div>
      </div>

      {/* Card Body */}
      <div className="flex flex-grow flex-col justify-between p-3 gap-4">
        <h3 className="w-20 truncate text-sm font-semibold">{card.name}</h3>
        <p className="flex-grow text-xs text-slate-600">{card.description}</p>

        {/* Card Value */}
        <div className="mt-2 flex justify-end">
          <span className="rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
            {card.type === 'attack' && (
              <span className="text-game-attack">{card.value} DMG</span>
            )}
            {card.type === 'defense' && (
              <span className="text-game-defense">{card.value} BLK</span>
            )}
            {card.type !== 'attack' && card.type !== 'defense' && (
              <span>{card.value}</span>
            )}
          </span>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-game-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </div>
  );
};

export default Card;
