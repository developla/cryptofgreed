'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useGameStore } from '@/lib/store/game';
import { Heart, Swords } from 'lucide-react';
import { toast } from 'sonner';

export function RestScreen() {
  const router = useRouter();
  const { currentCharacter, walletAddress, setCharacter } = useGameStore();
  const [isResting, setIsResting] = useState(false);

  const handleRest = async () => {
    if (!currentCharacter || !walletAddress) return;

    setIsResting(true);
    try {
      const response = await fetch('/api/character/rest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': walletAddress,
        },
        body: JSON.stringify({
          characterId: currentCharacter.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to rest');

      const { character } = await response.json();
      
      // Update character in store immediately
      setCharacter(character);
      
      toast.success('You feel refreshed!');
      router.push('/map');
    } catch (error) {
      console.error('Rest error:', error);
      toast.error('Failed to rest');
    } finally {
      setIsResting(false);
    }
  };

  const handleContinue = () => {
    router.push('/map');
  };

  if (!currentCharacter) return null;

  const healAmount = Math.floor(currentCharacter.maxHealth * 0.3);

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
                  Heal {healAmount} HP (
                  {Math.floor((healAmount / currentCharacter.maxHealth) * 100)}%
                  of max HP)
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleRest}
              disabled={
                isResting ||
                currentCharacter.health === currentCharacter.maxHealth
              }
            >
              Rest
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
            >
              Continue
            </Button>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold">Current Status</h2>
          <div className="flex gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Health</p>
              <p className="font-bold">
                {currentCharacter.health} / {currentCharacter.maxHealth}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}