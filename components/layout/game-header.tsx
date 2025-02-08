'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { WalletConnect } from '../wallet-connect';
import { useGameStore } from '@/lib/store/game';
import { Sword, Coins, Heart, Zap, Trophy } from 'lucide-react';

export function GameHeader() {
  const { currentCharacter, isConnected, checkWalletConnection } =
    useGameStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const isStillConnected = await checkWalletConnection();
      if (!isStillConnected && pathname !== '/') {
        router.push('/');
      }
    };

    checkAuth();
  }, [checkWalletConnection, router, pathname]);

  // Only show minimal header on home page
  if (pathname === '/') {
    return (
      <div className="fixed left-0 right-0 top-0 z-50 border-b bg-background/95">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-end">
            <WalletConnect minimal />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b bg-background/95">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {currentCharacter && (
              <>
                <Card className="shrink-0 p-2">
                  <div className="flex items-center gap-2">
                    <Sword className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">
                        {currentCharacter.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <p className="text-xs text-muted-foreground">
                          Level {currentCharacter.level}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="shrink-0 p-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="w-32">
                        <Progress
                          value={
                            (currentCharacter.health /
                              currentCharacter.maxHealth) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {currentCharacter.health}/{currentCharacter.maxHealth}{' '}
                        HP
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="shrink-0 p-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {currentCharacter.energy}/{currentCharacter.maxEnergy}
                      </p>
                      <p className="text-xs text-muted-foreground">Energy</p>
                    </div>
                  </div>
                </Card>

                <Card className="shrink-0 p-2">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {currentCharacter.gold}
                      </p>
                      <p className="text-xs text-muted-foreground">Gold</p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>

          <WalletConnect minimal />
        </div>
      </div>
    </div>
  );
}
