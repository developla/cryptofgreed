import React from 'react';
import { Enemy as EnemyType } from '@/context/GameContext';
import { Heart, Shield, Sword, Zap } from 'lucide-react';

interface EnemyProps {
  enemy: EnemyType;
  defense: number;
}

const Enemy: React.FC<EnemyProps> = ({ enemy, defense }) => {
  // Get the intent icon based on the enemy's intent
  const getIntentIcon = () => {
    switch (enemy.intent) {
      case 'attack':
        return <Sword className="h-4 w-4 text-game-attack" />;
      case 'defend':
        return <Shield className="h-4 w-4 text-game-defense" />;
      case 'buff':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'debuff':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Sword className="h-4 w-4 text-game-attack" />;
    }
  };

  // Calculate health percentage
  const healthPercentage = (enemy.currentHealth / enemy.maxHealth) * 100;

  return (
    <div className="glass-card w-full rounded-xl border-2 border-red-900/20 p-3">
      <div className="flex items-center space-x-3">
        {/* Enemy Image (smaller) */}
        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 border-red-900/30 bg-gradient-to-br from-red-900/30 to-red-800/50 shadow-lg">
          <span className="text-2xl font-bold text-white">
            {enemy.name.charAt(0)}
          </span>

          {/* Intent icon badge */}
          <div
            className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-full 
            ${
              enemy.intent === 'attack'
                ? 'bg-game-attack'
                : enemy.intent === 'defend'
                  ? 'bg-game-defense'
                  : enemy.intent === 'buff'
                    ? 'bg-yellow-500'
                    : 'bg-purple-500'
            } 
            flex items-center justify-center border-2 border-slate-800`}
          >
            {getIntentIcon()}
          </div>
        </div>

        <div className="flex-grow">
          {/* Enemy Name */}
          <h2 className="text-base font-bold">{enemy.name}</h2>

          {/* Health Bar */}
          <div className="relative mb-2 h-4 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="absolute h-full bg-game-health transition-all duration-500 ease-in-out"
              style={{ width: `${healthPercentage}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white drop-shadow-md">
                {enemy.currentHealth} / {enemy.maxHealth}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex space-x-2">
            {/* Defense */}
            {defense > 0 && (
              <div className="flex items-center space-x-1 rounded-full bg-game-defense/10 px-2 py-0.5 text-xs text-game-defense">
                <Shield className="h-3 w-3" />
                <span>{defense}</span>
              </div>
            )}

            {/* Intent */}
            <div
              className={`flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs ${
                enemy.intent === 'attack'
                  ? 'bg-game-attack/10 text-game-attack'
                  : enemy.intent === 'defend'
                    ? 'bg-game-defense/10 text-game-defense'
                    : enemy.intent === 'buff'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-purple-500/10 text-purple-500'
              }`}
            >
              {getIntentIcon()}
              <span>{enemy.intentValue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enemy;
