'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useGameStore } from '@/lib/store/game';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { type EnemyTemplate } from '@/lib/game/enemies';
import {
  calculateDamage,
  applyCardEffects,
  type BattleState,
  type StatusEffect,
} from '@/lib/game/battle';

export function BattleScreen() {
  const router = useRouter();
  const {
    currentCharacter,
    playerHand,
    playerDeck,
    playerDiscardPile,
    drawCard,
    playCard,
    discardHand,
    endBattle,
    startBattle,
    isConnected,
    setCharacter,
  } = useGameStore();

  const [battleState, setBattleState] = useState<BattleState>({
    playerHealth: 0,
    playerBlock: 0,
    playerEnergy: 0,
    playerEffects: [],
    enemyHealth: 0,
    enemyBlock: 0,
    enemyEffects: [],
  });

  const [currentEnemy, setCurrentEnemy] = useState<EnemyTemplate | null>(null);
  const [enemyIntent, setEnemyIntent] = useState('');
  const [currentMove, setCurrentMove] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [battleInitialized, setBattleInitialized] = useState(false);

  useEffect(() => {
    // Show warning about page refresh
    toast.warning('Warning: Refreshing the page will reset the battle state.', {
      duration: 5000,
      position: 'top-center',
    });
  }, []);

  const checkBlockedStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/character/get', {
        credentials: 'include',
      });

      if (response.ok) {
        const { characters } = await response.json();
        const character = characters.find(
          (c: any) => c.id === currentCharacter?.id
        );
        if (character?.user?.blockedFromBattles) {
          setIsBlocked(true);
          toast.error(
            'Your account is blocked from battles. Please contact support for assistance.',
            { duration: 10000 }
          );
          router.push('/map');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to check blocked status:', error);
      return false;
    }
  }, [currentCharacter, router]);

  const determineEnemyIntent = useCallback(() => {
    if (!currentEnemy) return;

    const totalWeight = currentEnemy.moves.reduce(
      (sum, move) => sum + move.weight,
      0
    );
    let random = Math.random() * totalWeight;

    for (const move of currentEnemy.moves) {
      random -= move.weight;
      if (random <= 0) {
        setEnemyIntent(move.description);
        setCurrentMove(move);
        return;
      }
    }
  }, [currentEnemy]);

  const initializeBattle = useCallback(async () => {
    if (!currentCharacter || !isConnected || battleInitialized) return;

    try {
      setIsLoading(true);

      // Check if user is blocked
      const blocked = await checkBlockedStatus();
      if (blocked) return;

      // Fetch fresh character data
      const characterResponse = await fetch('/api/character/get', {
        credentials: 'include',
      });

      if (!characterResponse.ok) {
        throw new Error('Failed to fetch character data');
      }

      const { characters } = await characterResponse.json();
      const updatedCharacter = characters.find(
        (c: any) => c.id === currentCharacter.id
      );

      if (!updatedCharacter) {
        throw new Error('Character not found');
      }

      // Update character in store with fresh data
      setCharacter(updatedCharacter);

      // Fetch enemy data
      const enemyResponse = await fetch(
        `/api/enemy/get?level=${updatedCharacter.level}`,
        {
          credentials: 'include',
        }
      );

      if (!enemyResponse.ok) {
        throw new Error('Failed to fetch enemy');
      }

      const { enemy } = await enemyResponse.json();
      setCurrentEnemy(enemy);
      setBattleState({
        playerHealth: updatedCharacter.health,
        playerBlock: 0,
        playerEnergy: updatedCharacter.maxEnergy,
        playerEffects: [],
        enemyHealth: enemy.health,
        enemyBlock: 0,
        enemyEffects: [],
      });

      // End any existing battle and start a new one
      endBattle();
      startBattle();

      // Draw initial hand
      for (let i = 0; i < 5; i++) {
        drawCard();
      }

      determineEnemyIntent();
      setBattleInitialized(true);
    } catch (error) {
      console.error('Failed to initialize battle:', error);
      toast.error('Failed to start battle');
      router.push('/map');
    } finally {
      setIsLoading(false);
    }
  }, [
    currentCharacter,
    isConnected,
    battleInitialized,
    checkBlockedStatus,
    setCharacter,
    endBattle,
    startBattle,
    drawCard,
    router,
    determineEnemyIntent,
  ]);

  useEffect(() => {
    if (!currentCharacter || !isConnected) {
      router.push('/');
      return;
    }

    initializeBattle();
  }, [currentCharacter, isConnected, router, initializeBattle]);

  const handlePlayCard = async (cardIndex: number) => {
    const card = playerHand[cardIndex];
    if (!card || !currentEnemy) return;

    if (battleState.playerEnergy < card.energy) {
      toast.error('Not enough energy!');
      return;
    }

    let newState = { ...battleState };

    if (card.damage) {
      const { damage, remainingBlock } = calculateDamage(
        card.damage,
        battleState.playerEffects,
        battleState.enemyEffects,
        battleState.enemyBlock
      );

      newState = {
        ...newState,
        enemyHealth: Math.max(0, newState.enemyHealth - damage),
        enemyBlock: remainingBlock,
        playerEnergy: newState.playerEnergy - card.energy,
      };
    }

    if (card.block) {
      newState = {
        ...newState,
        playerBlock: newState.playerBlock + card.block,
        playerEnergy: newState.playerEnergy - card.energy,
      };
    }

    if (card.effects) {
      newState = applyCardEffects(card.effects, newState, true);
    }

    setBattleState(newState);
    playCard(cardIndex);

    if (newState.enemyHealth <= 0) {
      await handleVictory();
    }
  };

  const handleEnemyTurn = useCallback(() => {
    if (!currentEnemy || !currentMove) return;

    let newState = { ...battleState };

    if (currentMove.damage) {
      const { damage, remainingBlock } = calculateDamage(
        currentMove.damage,
        battleState.enemyEffects,
        battleState.playerEffects,
        battleState.playerBlock
      );

      newState = {
        ...newState,
        playerHealth: Math.max(0, newState.playerHealth - damage),
        playerBlock: remainingBlock,
      };
    }

    if (currentMove.block) {
      newState = {
        ...newState,
        enemyBlock: newState.enemyBlock + currentMove.block,
      };
    }

    if (currentMove.effects) {
      newState = applyCardEffects(currentMove.effects, newState, false);
    }

    setBattleState(newState);

    if (newState.playerHealth <= 0) {
      handleDefeat();
    }
  }, [currentEnemy, currentMove, battleState]);

  const handleEndTurn = () => {
    handleEnemyTurn();
    discardHand();
    for (let i = 0; i < 5; i++) {
      drawCard();
    }

    setBattleState((prev) => ({
      ...prev,
      playerEnergy: currentCharacter?.maxEnergy || 0,
      playerBlock: 0,
      enemyBlock: 0,
    }));

    determineEnemyIntent();
  };

  const handleVictory = async () => {
    if (!currentCharacter || !currentEnemy || !isConnected) return;

    try {
      setIsLoading(true); // Add loading state during reward processing

      // Calculate rewards
      const goldReward =
        Math.floor(
          Math.random() *
            (currentEnemy.goldReward.max - currentEnemy.goldReward.min + 1)
        ) + currentEnemy.goldReward.min;

      const response = await fetch('/api/character/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          characterId: currentCharacter.id,
          experience: currentEnemy.experienceReward,
          gold: goldReward,
          health: battleState.playerHealth, // Important: Update final health
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update rewards');
      }

      const { character, leveledUp, healthIncrease, energyIncrease } =
        await response.json();

      // Update character in store
      setCharacter(character);

      // Show success messages
      toast.success('Victory!', { id: 'battle-victory' });
      toast.success(
        `Earned ${goldReward} gold and ${currentEnemy.experienceReward} experience!`,
        { id: 'battle-rewards' }
      );

      if (leveledUp) {
        toast.success(
          `Level Up! Gained ${healthIncrease} max HP and ${energyIncrease} energy!`,
          { duration: 5000, id: 'level-up' }
        );
      }

      // End battle and return to map
      endBattle();
      router.push('/map');
    } catch (error) {
      console.error('Failed to process victory:', error);
      toast.error('Failed to update rewards and stats. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDefeat = async () => {
    if (!isConnected) return;

    try {
      setIsLoading(true);

      // Update character health and block status
      const response = await fetch('/api/character/update', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: currentCharacter?.id,
          health: 0, // Set health to 0 on defeat
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update character status');
      }

      // Block character from battles
      await fetch('/api/character/block', {
        method: 'POST',
        credentials: 'include',
      });

      toast.error(
        'Defeat! Your character has been blocked from further battles.'
      );
      endBattle();
      router.push('/map');
    } catch (error) {
      console.error('Failed to process defeat:', error);
      toast.error('Failed to update character status');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background/90 to-background p-4">
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-3/4 rounded bg-primary/20"></div>
            <div className="h-8 rounded bg-primary/10"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background/90 to-background p-4">
        <Card className="max-w-md p-6 text-center">
          <h2 className="mb-4 text-2xl font-bold text-destructive">
            Account Blocked
          </h2>
          <p className="mb-4 text-muted-foreground">
            Your account has been blocked from participating in battles. This
            may be due to:
          </p>
          <ul className="mb-6 list-inside list-disc text-left text-muted-foreground">
            <li>Previous battle violations</li>
            <li>Suspicious activity</li>
            <li>Multiple losses in succession</li>
          </ul>
          <p className="mb-6 text-sm text-muted-foreground">
            To regain access, please contact support or consider upgrading to a
            premium account for automatic reinstatement.
          </p>
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => window.open('mailto:support@example.com')}
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/map')}
            >
              Return to Map
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentCharacter || !currentEnemy) {
    return null;
  }

  const playerHealthPercent = Math.max(
    0,
    Math.min(100, (battleState.playerHealth / currentCharacter.maxHealth) * 100)
  );

  const enemyHealthPercent = Math.max(
    0,
    Math.min(100, (battleState.enemyHealth / currentEnemy.maxHealth) * 100)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-4 pt-20">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold">{currentEnemy.name}</h2>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>{battleState.enemyBlock}</span>
          </div>
        </div>
        <Progress value={enemyHealthPercent} className="mb-2" />
        <div className="text-sm text-muted-foreground">
          Intent: {enemyIntent}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Enemy Health: {battleState.enemyHealth}/{currentEnemy.maxHealth}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{currentCharacter.name}</h2>
            <Progress value={playerHealthPercent} className="w-48" />
            <div className="text-sm text-muted-foreground">
              Health: {battleState.playerHealth}/{currentCharacter.maxHealth}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>{battleState.playerBlock}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {battleState.playerEnergy}
              </div>
              <span className="text-sm text-muted-foreground">Energy</span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {playerHand.map((card, index) => (
            <Card
              key={index}
              className="w-32 shrink-0 cursor-pointer p-2 transition-colors hover:bg-primary/10"
              onClick={() => handlePlayCard(index)}
            >
              <div className="mb-1 text-sm font-bold">{card.name}</div>
              <div className="mb-2 text-xs text-muted-foreground">
                {card.description}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>{card.type}</span>
                <span>{card.energy} Energy</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Draw Pile: {playerDeck.length}</span>
            <span>Discard: {playerDiscardPile.length}</span>
          </div>
          <Button onClick={handleEndTurn}>End Turn</Button>
        </div>
      </div>
    </div>
  );
}
