'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import {
  Sword,
  ShoppingBag,
  Sparkles,
  Tent,
  Coins,
  Shield,
  Skull,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PathOption {
  id: string;
  type: 'BATTLE' | 'MERCHANT' | 'EVENT' | 'REST' | 'TREASURE';
  title: string;
  description: string;
  icon: React.ElementType;
  difficulty?: 'NORMAL' | 'ELITE' | 'BOSS';
  rewards?: string[];
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
    rewards: ['50-100 Gold', '25 XP', 'Common Card'],
  });

  // Add elite battle if level is high enough
  if (currentLevel >= 3) {
    options.push({
      id: 'elite',
      type: 'BATTLE',
      title: 'Elite Enemy',
      description: 'A powerful foe with unique abilities.',
      icon: Shield,
      difficulty: 'ELITE',
      rewards: ['100-200 Gold', '50 XP', 'Rare Card'],
    });
  }

  // Add boss battle every 5 levels
  if (currentLevel % 5 === 0) {
    options.push({
      id: 'boss',
      type: 'BATTLE',
      title: 'Boss Battle',
      description: 'A challenging boss fight.',
      icon: Skull,
      difficulty: 'BOSS',
      rewards: ['250-500 Gold', '100 XP', 'Epic Item'],
    });
  }

  // Add rest site
  options.push({
    id: 'rest',
    type: 'REST',
    title: 'Rest Site',
    description: 'Heal your wounds or upgrade a card.',
    icon: Tent,
    rewards: ['Heal 30% HP', 'Upgrade 1 Card'],
  });

  // Add merchant with 30% chance
  if (Math.random() < 0.3) {
    options.push({
      id: 'merchant',
      type: 'MERCHANT',
      title: 'Merchant',
      description: 'Buy cards and equipment.',
      icon: ShoppingBag,
      rewards: ['Shop Items', 'Remove Cards'],
    });
  }

  // Add treasure room with 20% chance
  if (Math.random() < 0.2) {
    options.push({
      id: 'treasure',
      type: 'TREASURE',
      title: 'Treasure Room',
      description: 'Find valuable loot.',
      icon: Coins,
      rewards: ['100-300 Gold', 'Random Item'],
    });
  }

  // Add random event with 25% chance
  if (Math.random() < 0.25) {
    options.push({
      id: 'event',
      type: 'EVENT',
      title: 'Mystery Event',
      description: 'An unexpected encounter.',
      icon: Sparkles,
      rewards: ['???'],
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
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {paths.map((path) => {
        const Icon = path.icon;
        return (
          <Card
            key={path.id}
            className={cn(
              'cursor-pointer p-4 transition-all hover:scale-105 hover:shadow-lg',
              selectedPath?.id === path.id && 'border-primary bg-primary/5'
            )}
            onClick={() => handlePathSelect(path)}
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className={cn(
                  'rounded-lg p-2',
                  path.difficulty === 'ELITE'
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : path.difficulty === 'BOSS'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-primary/10 text-primary'
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">{path.title}</h3>
                {path.difficulty && (
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      path.difficulty === 'ELITE'
                        ? 'text-yellow-500'
                        : path.difficulty === 'BOSS'
                          ? 'text-red-500'
                          : 'text-primary'
                    )}
                  >
                    {path.difficulty}
                  </span>
                )}
              </div>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {path.description}
            </p>
            {path.rewards && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  Rewards:
                </p>
                <ul className="list-inside list-disc space-y-1">
                  {path.rewards.map((reward, index) => (
                    <li key={index} className="text-xs text-muted-foreground">
                      {reward}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
