'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { AuthHeader } from './auth-header';
import { useGameStore } from '@/lib/store/game';
import {
  Sword,
  Coins,
  Heart,
  Zap,
  ShieldCheck,
  Settings2,
  RefreshCw,
  Settings,
  Menu,
  Star,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

interface Equipment {
  id: string;
  name: string;
  description: string;
  effects: Array<{
    type: string;
    value: number;
  }>;
}

const EXPERIENCE_PER_LEVEL = 100;

export function GameHeader() {
  const { currentCharacter, isConnected, checkAuth, setCharacter } =
    useGameStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showGearSheet, setShowGearSheet] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (mounted && !isAuthenticated && pathname !== '/') {
        router.push('/');
      }
    };

    verifyAuth();

    return () => {
      mounted = false;
    };
  }, [checkAuth, router, pathname]);

  const handleRefreshGear = async () => {
    if (!currentCharacter) return;

    setIsRefreshing(true);
    try {
      const response = await fetch('/api/character/get', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh gear');
      }

      const { characters } = await response.json();
      const updatedCharacter = characters.find(
        (c: any) => c.id === currentCharacter.id
      );

      if (updatedCharacter) {
        setCharacter(updatedCharacter);
        toast.success('Gear list refreshed');
      }
    } catch (error) {
      console.error('Failed to refresh gear:', error);
      toast.error('Failed to refresh gear');
    } finally {
      setIsRefreshing(false);
    }
  };

  const calculateXpProgress = () => {
    if (!currentCharacter) return 0;
    const currentLevelXp = (currentCharacter.level - 1) * EXPERIENCE_PER_LEVEL;
    const progress =
      ((currentCharacter.experience - currentLevelXp) / EXPERIENCE_PER_LEVEL) *
      100;
    return Math.min(100, Math.max(0, progress));
  };

  if (pathname === '/') {
    return (
      <div className="fixed left-0 right-0 top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-end">
            <AuthHeader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-amber-900/30 bg-gradient-to-b from-background to-background/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Mobile Menu */}
          <div className="flex items-center justify-between sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {isConnected && pathname !== '/settings' && (
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <AuthHeader />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {currentCharacter && (
              <div className="flex items-center gap-2">
                <Card className="border-red-500/30 bg-background/60 p-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">
                      {currentCharacter.health}/{currentCharacter.maxHealth}
                    </span>
                  </div>
                </Card>
                <Card className="border-yellow-500/30 bg-background/60 p-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {currentCharacter.energy}/{currentCharacter.maxEnergy}
                    </span>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Character Stats */}
          <div className="no-scrollbar flex items-center gap-4 overflow-x-auto pb-2">
            {currentCharacter && (
              <>
                <Card className="relative shrink-0 overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5 p-2.5 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 p-2">
                      <Sword className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-wide">
                        {currentCharacter.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          <Badge variant="outline" className="ml-1 px-1.5 py-0">
                            <span className="text-xs font-semibold">
                              Level {currentCharacter.level}
                            </span>
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-1.5 w-full">
                        <Progress
                          value={calculateXpProgress()}
                          className="h-1.5 bg-primary/20"
                        />
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          XP: {currentCharacter.experience} /{' '}
                          {currentCharacter.level * EXPERIENCE_PER_LEVEL}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Hide these cards on mobile, shown in the top bar instead */}
                <div className="hidden sm:flex sm:items-center sm:gap-4">
                  <Card className="shrink-0 overflow-hidden border-red-500/20 bg-gradient-to-br from-background to-red-950/5 p-2.5 shadow-md">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="w-32">
                          <Progress
                            value={
                              (currentCharacter.health /
                                currentCharacter.maxHealth) *
                              100
                            }
                            className="h-2 bg-red-950/20"
                          />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {currentCharacter.health}/{currentCharacter.maxHealth}{' '}
                          HP
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="shrink-0 overflow-hidden border-yellow-500/20 bg-gradient-to-br from-background to-yellow-950/5 p-2.5 shadow-md">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {currentCharacter.energy}/{currentCharacter.maxEnergy}
                        </p>
                        <p className="text-xs text-muted-foreground">Energy</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="shrink-0 overflow-hidden border-amber-500/20 bg-gradient-to-br from-background to-amber-950/5 p-2.5 shadow-md">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-500" />
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
                      className="shrink-0 cursor-pointer overflow-hidden border-blue-500/20 bg-gradient-to-br from-background to-blue-950/5 p-2.5 shadow-md transition-all hover:border-blue-500/40 hover:bg-blue-950/10 hover:shadow-lg"
                      onClick={() => setShowGearSheet(true)}
                    >
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-sm font-medium">Gear</p>
                          <p className="text-xs text-muted-foreground">
                            {currentCharacter.equipment?.length || 0} Items
                          </p>
                        </div>
                      </div>
                    </Card>
                  </SheetTrigger>
                  <SheetContent className="border-l-primary/20 bg-gradient-to-br from-background to-primary/5">
                    <SheetHeader>
                      <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl font-bold">
                          Equipment
                        </SheetTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRefreshGear}
                          disabled={isRefreshing}
                          className="gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                          />
                          Refresh
                        </Button>
                      </div>
                      <SheetDescription>
                        Manage your character's equipment and gear
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4">
                      {currentCharacter.equipment &&
                      currentCharacter.equipment.length > 0 ? (
                        <div className="space-y-4">
                          {currentCharacter.equipment.map((item: Equipment) => (
                            <Card
                              key={item.id}
                              className="flex items-start gap-3 border-primary/20 bg-gradient-to-br from-background to-primary/5 p-3 shadow-md"
                            >
                              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-blue-400" />
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {item.effects.map((effect, index) => (
                                    <span
                                      key={index}
                                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium"
                                    >
                                      {effect.type}: +{effect.value}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-primary/20 bg-primary/5 text-center text-muted-foreground">
                          <div>
                            <ShieldCheck className="mx-auto mb-3 h-10 w-10 opacity-40" />
                            <p className="font-medium">No equipment found</p>
                            <p className="mt-1 text-sm">
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

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 sm:flex">
            {isConnected && pathname !== '/settings' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/settings')}
                className="gap-2 hover:bg-primary/10"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            )}
            <AuthHeader />
          </div>
        </div>
      </div>
    </div>
  );
}
