import React from 'react';
import { Character as CharacterType } from '@/context/GameContext';
import { Heart, Shield, Sword, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CharacterProps {
  character: CharacterType;
  defense: number;
}

const Character: React.FC<CharacterProps> = ({ character, defense }) => {
  // Calculate health percentage
  const healthPercentage =
    (character.currentHealth / character.maxHealth) * 100;

  // Calculate equipment bonuses
  const calculateAttackBonus = () => {
    if (!character.equippedItems.weapon) return 0;
    return character.equippedItems.weapon.value || 0;
  };

  const calculateDefenseBonus = () => {
    if (!character.equippedItems.armor) return 0;
    return character.equippedItems.armor.value || 0;
  };

  const calculateSpecialBonus = () => {
    if (!character.equippedItems.accessory) return 0;
    return character.equippedItems.accessory.value || 0;
  };

  const attackBonus = calculateAttackBonus();
  const defenseBonus = calculateDefenseBonus();
  const specialBonus = calculateSpecialBonus();

  return (
    <div className="glass-card w-full rounded-xl border-2 border-game-primary/20 p-3">
      <div className="flex items-center space-x-3">
        {/* Character Image (smaller) */}
        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 border-slate-100 bg-gradient-to-br from-game-primary/20 to-game-primary/40 shadow-lg">
          <span className="text-2xl font-bold text-game-primary">
            {character.name.charAt(0)}
          </span>

          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-800 bg-amber-500">
            <span className="text-xs font-bold text-white">
              {character.level}
            </span>
          </div>
        </div>

        <div className="flex-grow">
          {/* Character Name and Class */}
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-bold">{character.name}</h2>
            <div className="text-xs font-medium text-amber-600">
              {character.class}
            </div>
          </div>

          {/* Health Bar */}
          <div className="mb-2 w-full">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">HP</span>
              <span className="font-medium">
                {character.currentHealth}/{character.maxHealth}
              </span>
            </div>
            <Progress
              value={healthPercentage}
              className="h-2.5 bg-slate-200 [&>div]:bg-game-health"
            />
          </div>

          {/* Stats - Compact horizontal layout */}
          <div className="flex space-x-2">
            {/* Attack */}
            <div className="flex items-center space-x-1 rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-xs">
              <Sword className="h-3 w-3 text-game-attack" />
              <span>{attackBonus > 0 ? `+${attackBonus}` : 'Base'}</span>
            </div>

            {/* Defense */}
            <div className="flex items-center space-x-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs">
              <Shield className="h-3 w-3 text-game-defense" />
              <span>{defense + defenseBonus}</span>
            </div>

            {/* Special Bonus */}
            {specialBonus > 0 && (
              <div className="flex items-center space-x-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs">
                <Award className="h-3 w-3 text-amber-500" />
                <span>+{specialBonus}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Character;
