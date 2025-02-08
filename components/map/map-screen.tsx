'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useGameStore } from '@/lib/store/game';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { PathSelection } from './path-selection';

export function MapScreen() {
  const { currentCharacter, isConnected, walletAddress, setCharacter } =
    useGameStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !currentCharacter) {
      router.push('/');
    }
  }, [isConnected, currentCharacter, router]);

  const handleSwitchCharacter = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/character/get', {
        headers: {
          'x-wallet-address': walletAddress,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch characters');

      const { characters } = await response.json();
      if (characters.length > 0) {
        setCharacter(null); // Clear current character
        router.push('/'); // Go to character selection
      }
    } catch (error) {
      console.error('Failed to switch character:', error);
      toast.error('Failed to load characters');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentCharacter) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-4 pt-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">The Crypto Spire</h1>
            <p className="text-sm text-muted-foreground">
              Choose your next destination wisely
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitchCharacter}
            disabled={isLoading}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Switch Character
          </Button>
        </div>

        <Card className="p-4">
          <PathSelection
            characterLevel={currentCharacter.level}
            onPathSelect={() => {}}
          />
        </Card>
      </div>
    </div>
  );
}
