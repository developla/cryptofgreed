import React, { useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Heart,
  Award,
  Zap,
  Backpack,
  Sword,
  Layers,
  Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const CharacterHUD: React.FC = () => {
  const { state, dispatch } = useGame();
  const { activeCharacter, quickAccessOpen, user } = state;
  const quickAccessRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Handle clicks outside of the quick access panel
    const handleClickOutside = (event: MouseEvent) => {
      if (
        quickAccessOpen &&
        quickAccessRef.current &&
        !quickAccessRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        dispatch({ type: 'TOGGLE_QUICK_ACCESS' });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [quickAccessOpen, dispatch]);

  // Only show HUD if both activeCharacter exists and user is logged in
  if (!activeCharacter || !user?.isLoggedIn) return null;

  const experiencePercentage =
    (activeCharacter.experience / activeCharacter.experienceToNextLevel) * 100;

  const healthPercentage =
    (activeCharacter.currentHealth / activeCharacter.maxHealth) * 100;

  const handleNavigate = (page: 'inventory-system' | 'deck') => {
    dispatch({ type: 'NAVIGATE', payload: page });
    dispatch({ type: 'TOGGLE_QUICK_ACCESS' });
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Main HUD Card */}
      <Card className="bg-white/90 p-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          {/* Character Level */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-game-primary font-bold text-white">
            {activeCharacter.level}
          </div>

          {/* Character Stats */}
          <div className="flex-grow">
            <div className="mb-1 flex flex-wrap items-center space-x-2 text-sm font-medium">
              <span>{activeCharacter.name}</span>
              <Heart className="h-3 w-3 text-game-health" />
              <span>
                {activeCharacter.currentHealth}/{activeCharacter.maxHealth}
              </span>
              <Coins className="ml-1 h-3 w-3 text-amber-500" />
              <span>{activeCharacter.gold}</span>
            </div>

            {/* Health Bar */}
            <Progress
              value={healthPercentage}
              className={cn('mb-1 h-2', 'bg-secondary [&>div]:bg-game-health')}
            />

            {/* XP Bar */}
            <div className="flex items-center text-xs text-slate-600">
              <Award className="mr-1 h-3 w-3" />
              <span>
                XP: {activeCharacter.experience}/
                {activeCharacter.experienceToNextLevel}
              </span>
            </div>
            <Progress
              value={experiencePercentage}
              className={cn('h-1.5', 'bg-secondary [&>div]:bg-yellow-400')}
            />
          </div>

          {/* Quick Access Button */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 bg-slate-100 hover:bg-slate-200"
            onClick={() => dispatch({ type: 'TOGGLE_QUICK_ACCESS' })}
            ref={buttonRef}
          >
            <Backpack className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Quick Access Panel (conditionally rendered) */}
      {quickAccessOpen && (
        <Card
          className="absolute bottom-16 left-0 w-48 animate-fade-in bg-white/95 p-2 shadow-lg backdrop-blur-sm"
          ref={quickAccessRef}
        >
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigate('inventory-system')}
            >
              <Backpack className="mr-2 h-4 w-4" />
              <span>Inventory</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigate('deck')}
            >
              <Layers className="mr-2 h-4 w-4" />
              <span>Deck Cards</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CharacterHUD;
