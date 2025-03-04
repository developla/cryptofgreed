import React from 'react';
import { Swords, Skull, ShoppingBag, Coffee, Sparkles } from 'lucide-react';
import { NodeType } from '@/context/types';

interface MapNodeProps {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  available: boolean;
  visited: boolean;
  isCurrentNode: boolean;
  onClick: () => void;
}

const MapNode: React.FC<MapNodeProps> = ({
  id,
  type,
  x,
  y,
  available,
  visited,
  isCurrentNode,
  onClick,
}) => {
  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'battle':
        return <Swords className="h-5 w-5" />;
      case 'elite':
        return <Skull className="h-5 w-5" />;
      case 'shop':
        return <ShoppingBag className="h-5 w-5" />;
      case 'boss':
        return <Skull className="h-5 w-5 text-red-500" />;
      case 'rest':
        return <Coffee className="h-5 w-5" />;
      case 'event':
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getNodeColor = (
    type: NodeType,
    available: boolean,
    visited: boolean
  ) => {
    if (visited) {
      return 'bg-slate-300 border-slate-400 opacity-60';
    }

    if (!available) {
      return 'bg-slate-200 border-slate-300 opacity-40 cursor-not-allowed';
    }

    switch (type) {
      case 'battle':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
      case 'elite':
        return 'bg-purple-100 border-purple-300 hover:bg-purple-200';
      case 'shop':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'boss':
        return 'bg-red-100 border-red-300 hover:bg-red-200';
      case 'rest':
        return 'bg-amber-100 border-amber-300 hover:bg-amber-200';
      case 'event':
        return 'bg-cyan-100 border-cyan-300 hover:bg-cyan-200';
    }
  };

  const getNodeTooltip = (type: NodeType) => {
    switch (type) {
      case 'battle':
        return 'Battle: Face an enemy and earn rewards';
      case 'elite':
        return 'Elite: Challenging enemy with better rewards';
      case 'shop':
        return 'Shop: Purchase cards, potions and equipment';
      case 'boss':
        return 'Boss: Extremely difficult battle with special rewards';
      case 'rest':
        return 'Rest: Heal HP, upgrade or remove cards';
      case 'event':
        return 'Event: Random encounters with various outcomes';
    }
  };

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 transform ${
        !available && !visited
          ? 'cursor-not-allowed'
          : visited
            ? 'cursor-default'
            : 'cursor-pointer'
      } group transition-all duration-300`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* Node tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-40 -translate-x-1/2 transform rounded bg-white p-2 text-center text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {getNodeTooltip(type)}
      </div>

      <div
        className={`
          h-14 w-14 rounded-full 
          ${getNodeColor(type, available, visited)} 
          flex items-center justify-center border-2 shadow-md 
          transition-all duration-300
          ${available && !visited ? 'hover:scale-110' : ''}
          ${visited ? 'scale-95' : ''}
        `}
        onClick={() => available && !visited && onClick()}
      >
        {getNodeIcon(type)}
      </div>

      {/* Current node indicator */}
      {isCurrentNode && (
        <div className="absolute right-[-8px] top-[-8px] h-5 w-5 animate-pulse rounded-full border-2 border-white bg-blue-500"></div>
      )}
    </div>
  );
};

export default MapNode;
