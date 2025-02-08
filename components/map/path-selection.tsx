'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Sword, ShoppingBag, Sparkles, Tent, Coins } from 'lucide-react';
import { toast } from 'sonner';

interface PathOption {
  id: string;
  type: 'BATTLE' | 'MERCHANT' | 'EVENT' | 'REST' | 'TREASURE';
  title: string;
  description: string;
  icon: React.ElementType;
  difficulty?: 'NORMAL' | 'ELITE' | 'BOSS';
}

const generatePathOptions = (currentLevel: number): PathOption[] => {
  const options: PathOption[] = [];

  // Always include at least one battle
  options.push({
    id: 'battle',
    type: 'BATTLE',
    title: 'Enemy Encounter',
    description: 'Face a normal enemy in combat.',
    icon: Sword,
    difficulty: 'NORMAL',
  });

  // Add elite battle if level is high enough
  if (currentLevel >= 3) {
    options.push({
      id: 'elite',
      type: 'BATTLE',
      title: 'Elite Enemy',
      description: 'A powerful foe with unique abilities and better rewards.',
      icon: Sword,
      difficulty: 'ELITE',
    });
  }

  // Add boss battle every 5 levels
  if (currentLevel % 5 === 0) {
    options.push({
      id: 'boss',
      type: 'BATTLE',
      title: 'Boss Battle',
      description: 'A challenging boss fight with exceptional rewards.',
      icon: Sword,
      difficulty: 'BOSS',
    });
  }

  // Add rest site if health is below 70%
  options.push({
    id: 'rest',
    type: 'REST',
    title: 'Rest Site',
    description: 'Heal your wounds or upgrade a card.',
    icon: Tent,
  });

  // Add merchant with 30% chance
  if (Math.random() < 0.3) {
    options.push({
      id: 'merchant',
      type: 'MERCHANT',
      title: 'Merchant',
      description: 'Buy cards, potions, and equipment.',
      icon: ShoppingBag,
    });
  }

  // Add treasure room with 20% chance
  if (Math.random() < 0.2) {
    options.push({
      id: 'treasure',
      type: 'TREASURE',
      title: 'Treasure Room',
      description: 'Find valuable loot and rare items.',
      icon: Coins,
    });
  }

  // Add random event with 25% chance
  if (Math.random() < 0.25) {
    options.push({
      id: 'event',
      type: 'EVENT',
      title: 'Mystery Event',
      description: 'An unexpected encounter with unknown consequences.',
      icon: Sparkles,
    });
  }

  // Shuffle and return 3 random options
  return options.sort(() => Math.random() - 0.5).slice(0, 3);
};

interface PathSelectionProps {
  characterLevel: number;
  onPathSelect: (path: PathOption) => void;
}

export function PathSelection({
  characterLevel,
  onPathSelect,
}: PathSelectionProps) {
  const [paths] = useState<PathOption[]>(() =>
    generatePathOptions(characterLevel)
  );
  const [selectedPath, setSelectedPath] = useState<PathOption | null>(null);
  const router = useRouter();

  const handlePathSelect = async (path: PathOption) => {
    setSelectedPath(path);
    onPathSelect(path);

    switch (path.type) {
      case 'BATTLE':
        try {
          await fetch('/api/enemy/seed', { method: 'POST' });
          router.push('/battle');
        } catch (error) {
          console.error('Failed to prepare battle:', error);
          toast.error('Failed to start battle');
        }
        break;
      case 'MERCHANT':
        router.push('/shop');
        break;
      case 'REST':
        router.push('/rest');
        break;
      case 'TREASURE':
      case 'EVENT':
        toast.info('This feature is coming soon!');
        router.push('/map');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Choose Your Path</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <Card
                key={path.id}
                className={`cursor-pointer p-6 transition-colors hover:bg-accent ${
                  selectedPath?.id === path.id ? 'border-primary' : ''
                }`}
                onClick={() => handlePathSelect(path)}
              >
                <div className="mb-4 flex items-center justify-center">
                  <Icon className="h-12 w-12" />
                </div>
                <h3 className="mb-2 text-center text-xl font-bold">
                  {path.title}
                </h3>
                {path.difficulty && (
                  <div className="mb-2 text-center">
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold ${
                        path.difficulty === 'ELITE'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : path.difficulty === 'BOSS'
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-primary/20 text-primary'
                      }`}
                    >
                      {path.difficulty}
                    </span>
                  </div>
                )}
                <p className="text-center text-sm text-muted-foreground">
                  {path.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
