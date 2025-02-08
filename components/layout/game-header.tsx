'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { WalletConnect } from '../wallet-connect';
import { useGameStore } from '@/lib/store/game';
import {
  Sword,
  Coins,
  Heart,
  Zap,
  Trophy,
  ShieldCheck,
  Settings2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const EXPERIENCE_PER_LEVEL = 100;

export function GameHeader() {
  const { currentCharacter, isConnected, checkWalletConnection } =
    useGameStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showGearSheet, setShowGearSheet] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isStillConnected = await checkWalletConnection();
      if (!isStillConnected && pathname !== '/') {
        router.push('/');
      }
    };

    checkAuth();
  }, [checkWalletConnection, router, pathname]);

  // Calculate XP progress
  const calculateXpProgress = () => {
    if (!currentCharacter) return 0;
    const currentLevelXp = (currentCharacter.level - 1) * EXPERIENCE_PER_LEVEL;
    const progress =
      ((currentCharacter.experience - currentLevelXp) / EXPERIENCE_PER_LEVEL) *
      100;
    return Math.min(100, Math.max(0, progress));
  };

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
                      <div className="mt-1 w-full">
                        <Progress
                          value={calculateXpProgress()}
                          className="h-1"
                        />
                        <p className="text-xs text-muted-foreground">
                          XP: {currentCharacter.experience} /{' '}
                          {currentCharacter.level * EXPERIENCE_PER_LEVEL}
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

                <Sheet open={showGearSheet} onOpenChange={setShowGearSheet}>
                  <SheetTrigger asChild>
                    <Card
                      className="shrink-0 cursor-pointer p-2 transition-colors hover:bg-accent"
                      onClick={() => setShowGearSheet(true)}
                    >
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Gear</p>
                          <p className="text-xs text-muted-foreground">
                            {currentCharacter.equipment?.length || 0} Items
                          </p>
                        </div>
                      </div>
                    </Card>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Equipment</SheetTitle>
                      <SheetDescription>
                        Manage your character's equipment and gear
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4">
                      {currentCharacter.equipment &&
                      currentCharacter.equipment.length > 0 ? (
                        <div className="space-y-4">
                          {currentCharacter.equipment.map((item) => (
                            <Card
                              key={item.id}
                              className="flex items-start gap-3 p-3"
                            >
                              <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {item.effects.map((effect, index) => (
                                    <span
                                      key={index}
                                      className="rounded-full bg-primary/10 px-2 py-1 text-xs"
                                    >
                                      {effect.type}: {effect.value}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-[300px] items-center justify-center text-center text-muted-foreground">
                          <div>
                            <ShieldCheck className="mx-auto mb-2 h-8 w-8 opacity-50" />
                            <p>No equipment found</p>
                            <p className="text-sm">
                              Visit shops or defeat enemies to obtain gear
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>

          <WalletConnect minimal />
        </div>
      </div>
    </div>
  );
}
