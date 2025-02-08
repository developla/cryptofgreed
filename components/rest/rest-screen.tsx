'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useGameStore } from '@/lib/store/game';
import { Heart, Swords } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '../ui/progress';

export function RestScreen() {
  const router = useRouter();
  const { currentCharacter, setCharacter } = useGameStore();
  const [isResting, setIsResting] = useState(false);

  const handleRest = async () => {
    if (!currentCharacter) return;

    setIsResting(true);
    try {
      const response = await fetch('/api/character/rest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          characterId: currentCharacter.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rest');
      }

      const { character, healAmount } = await response.json();
      setCharacter(character);

      toast.success(`Rested and recovered ${healAmount} HP!`);
      router.push('/map');
    } catch (error) {
      console.error('Rest error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to rest');
    } finally {
      setIsResting(false);
    }
  };

  const handleContinue = () => {
    router.push('/map');
  };

  if (!currentCharacter) return null;

  const healAmount = Math.floor(currentCharacter.maxHealth * 0.3);
  const healthPercent =
    (currentCharacter.health / currentCharacter.maxHealth) * 100;
  const isFullHealth = currentCharacter.health === currentCharacter.maxHealth;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Rest Site</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-4">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="text-lg font-bold">Rest</h3>
                <p className="text-sm text-muted-foreground">
                  {isFullHealth
                    ? 'Already at full health'
                    : `Heal ${healAmount} HP (${Math.floor(
                        (healAmount / currentCharacter.maxHealth) * 100
                      )}% of max HP)`}
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleRest}
              disabled={isResting || isFullHealth}
            >
              {isResting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Resting...
                </div>
              ) : isFullHealth ? (
                'Already at Full Health'
              ) : (
                'Rest'
              )}
            </Button>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-4">
              <Swords className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="text-lg font-bold">Continue</h3>
                <p className="text-sm text-muted-foreground">
                  Skip resting and continue your journey
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleContinue}
              disabled={isResting}
            >
              Continue
            </Button>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold">Current Status</h2>
          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Health</span>
              <span className="text-sm">
                {currentCharacter.health} / {currentCharacter.maxHealth}
              </span>
            </div>
            <Progress value={healthPercent} className="h-2" />
          </Card>
        </div>
      </div>
    </div>
  );
}
