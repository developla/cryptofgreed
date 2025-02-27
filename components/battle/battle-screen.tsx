'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useGameStore } from '@/lib/store/game';
import { Shield, Heart, Zap, Sword, Target, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { type EnemyTemplate } from '@/lib/game/enemies';
import {
  calculateDamage,
  applyCardEffects,
  type BattleState,
  type StatusEffect,
} from '@/lib/game/battle';
import Image from 'next/image';

// Enemy avatar mapping
const ENEMY_AVATARS: Record<string, string> = {
  Slime: 'https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=400&h=400&fit=crop&q=80',
  Goblin: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=400&h=400&fit=crop&q=80',
  'Dark Mage': 'https://images.unsplash.com/photo-1577033169343-75977941abdd?w=400&h=400&fit=crop&q=80',
};

// Card type background colors
const CARD_TYPE_COLORS: Record<string, string> = {
  ATTACK: 'bg-gradient-to-br from-red-900/40 to-red-700/20 hover:from-red-800/50 hover:to-red-600/30',
  SKILL: 'bg-gradient-to-br from-blue-900/40 to-blue-700/20 hover:from-blue-800/50 hover:to-blue-600/30',
  POWER: 'bg-gradient-to-br from-purple-900/40 to-purple-700/20 hover:from-purple-800/50 hover:to-purple-600/30',
};

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
  const [battleAnimation, setBattleAnimation] = useState('');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

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

    setSelectedCard(cardIndex);
    
    // Set animation based on card type
    if (card.type === 'ATTACK') {
      setBattleAnimation('player-attack');
    } else if (card.type === 'SKILL') {
      setBattleAnimation('player-skill');
    } else {
      setBattleAnimation('player-power');
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

    // Delay to show animation
    setTimeout(() => {
      setBattleState(newState);
      playCard(cardIndex);
      setBattleAnimation('');
      setSelectedCard(null);

      if (newState.enemyHealth <= 0) {
        handleVictory();
      }
    }, 600);
  };

  const handleEnemyTurn = useCallback(() => {
    if (!currentEnemy || !currentMove) return;

    setBattleAnimation('enemy-attack');
    
    setTimeout(() => {
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
      setBattleAnimation('');

      if (newState.playerHealth <= 0) {
        handleDefeat();
      }
    }, 800);
  }, [currentEnemy, currentMove, battleState]);

  const handleEndTurn = () => {
    handleEnemyTurn();
    discardHand();
    
    // Draw new hand after a delay
    setTimeout(() => {
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
    }, 1000);
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

  const getStatusEffectIcon = (effect: StatusEffect) => {
    switch (effect.type) {
      case 'STRENGTH':
        return <Sword className="h-4 w-4 text-red-400" />;
      case 'DEXTERITY':
        return <Zap className="h-4 w-4 text-green-400" />;
      case 'WEAK':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'VULNERABLE':
        return <Target className="h-4 w-4 text-purple-400" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
        <Card className="border-2 border-purple-500/30 bg-black/50 p-8 shadow-lg shadow-purple-500/10">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-3/4 rounded bg-purple-500/20"></div>
            <div className="h-8 rounded bg-purple-500/10"></div>
            <div className="h-20 rounded-lg bg-purple-500/5"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
        <Card className="max-w-md border-2 border-red-500/30 bg-black/50 p-6 text-center shadow-lg shadow-red-500/10">
          <h2 className="mb-4 text-2xl font-bold text-red-400">
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
              className="w-full bg-red-500 hover:bg-red-600"
              onClick={() => window.open('mailto:support@example.com')}
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              className="w-full border-red-500/50 text-red-400 hover:bg-red-950/30"
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

  const getEnemyAvatar = () => {
    return ENEMY_AVATARS[currentEnemy.name] || 'https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=400&h=400&fit=crop&q=80';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4">
      <div className="container mx-auto pt-16">
        {/* Enemy Section */}
        <div className="mb-8 rounded-lg border border-red-500/30 bg-black/30 p-4 shadow-lg shadow-red-500/5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`relative h-16 w-16 overflow-hidden rounded-full border-2 border-red-500/50 ${battleAnimation === 'player-attack' ? 'animate-shake' : ''}`}>
                <Image 
                  src={getEnemyAvatar()} 
                  alt={currentEnemy.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-400">{currentEnemy.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>Level {currentEnemy.level}</span>
                  {battleState.enemyBlock > 0 && (
                    <div className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5">
                      <Shield className="h-3 w-3 text-blue-400" />
                      <span className="text-blue-400">{battleState.enemyBlock}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enemy Status Effects */}
            <div className="flex gap-1">
              {battleState.enemyEffects.map((effect, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-1"
                  title={`${effect.type}: ${effect.value} (${effect.duration} turns)`}
                >
                  {getStatusEffectIcon(effect)}
                  <span className="text-xs">{effect.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Enemy Health Bar */}
          <div className="mb-2">
            <Progress 
              value={enemyHealthPercent} 
              className="h-3 bg-gray-800" 
            />
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-red-400">{battleState.enemyHealth}/{currentEnemy.maxHealth} HP</span>
              <div className="rounded-md bg-yellow-500/20 px-2 py-0.5 text-yellow-400">
                {enemyIntent}
              </div>
            </div>
          </div>
          
          {/* Battle Animation Area */}
          <div className={`my-4 flex h-16 items-center justify-center rounded-lg border border-purple-500/20 bg-black/50 ${
            battleAnimation === 'player-attack' ? 'bg-red-500/10' : 
            battleAnimation === 'enemy-attack' ? 'bg-yellow-500/10' : 
            battleAnimation === 'player-skill' ? 'bg-blue-500/10' : 
            battleAnimation === 'player-power' ? 'bg-purple-500/10' : ''
          }`}>
            {battleAnimation === 'player-attack' && (
              <div className="animate-pulse text-lg font-bold text-red-400">
                Player Attacks!
              </div>
            )}
            {battleAnimation === 'enemy-attack' && (
              <div className="animate-pulse text-lg font-bold text-yellow-400">
                Enemy Attacks!
              </div>
            )}
            {battleAnimation === 'player-skill' && (
              <div className="animate-pulse text-lg font-bold text-blue-400">
                Skill Activated!
              </div>
            )}
            {battleAnimation === 'player-power' && (
              <div className="animate-pulse text-lg font-bold text-purple-400">
                Power Activated!
              </div>
            )}
            {!battleAnimation && (
              <div className="text-sm text-gray-500">Battle Arena</div>
            )}
          </div>
        </div>

        {/* Player Section */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-blue-500/30 bg-gray-900/95 p-4">
          <div className="container mx-auto">
            {/* Player Stats */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-blue-500/50">
                  {currentCharacter.class === 'WARRIOR' && (
                    <div className="flex h-full w-full items-center justify-center bg-blue-900/50">
                      <Shield className="h-6 w-6 text-blue-400" />
                    </div>
                  )}
                  {currentCharacter.class === 'MAGE' && (
                    <div className="flex h-full w-full items-center justify-center bg-purple-900/50">
                      <Zap className="h-6 w-6 text-purple-400" />
                    </div>
                  )}
                  {currentCharacter.class === 'ROGUE' && (
                    <div className="flex h-full w-full items-center justify-center bg-green-900/50">
                      <Sword className="h-6 w-6 text-green-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-blue-400">{currentCharacter.name}</h2>
                  <div className="w-48">
                    <Progress 
                      value={playerHealthPercent} 
                      className="h-2 bg-gray-800" 
                    />
                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-green-400">
                        {battleState.playerHealth}/{currentCharacter.maxHealth} HP
                      </span>
                      
                      {/* Player Status Effects */}
                      <div className="flex gap-1">
                        {battleState.playerEffects.map((effect, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-1 rounded-full bg-purple-500/20 px-1.5 py-0.5"
                            title={`${effect.type}: ${effect.value} (${effect.duration} turns)`}
                          >
                            {getStatusEffectIcon(effect)}
                            <span className="text-xs">{effect.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {battleState.playerBlock > 0 && (
                  <div className="flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400">{battleState.playerBlock}</span>
                  </div>
                )}
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-gradient-to-br from-yellow-600 to-yellow-400 text-black">
                  <span className="text-lg font-bold">{battleState.playerEnergy}</span>
                  <span className="text-xs">Energy</span>
                </div>
              </div>
            </div>

            {/* Card Hand */}
            <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
              {playerHand.map((card, index) => {
                // Safely access card type with fallback
                const cardType = card.type || 'SKILL';
                const cardTypeColor = CARD_TYPE_COLORS[cardType] || CARD_TYPE_COLORS.SKILL;
                
                return (
                  <Card
                    key={index}
                    className={`w-36 shrink-0 cursor-pointer border-2 p-3 transition-all ${
                      selectedCard === index ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-gray-700'
                    } ${cardTypeColor} ${
                      battleState.playerEnergy < card.energy ? 'opacity-50' : 'hover:scale-105'
                    }`}
                    onClick={() => battleState.playerEnergy >= card.energy && handlePlayCard(index)}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-bold text-white">{card.name}</h3>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black">
                        {card.energy}
                      </span>
                    </div>
                    
                    <div className="mb-2 text-xs text-gray-300">
                      {card.description}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`
                        rounded-full px-2 py-0.5 
                        ${cardType === 'ATTACK' ? 'bg-red-500/30 text-red-300' : 
                          cardType === 'SKILL' ? 'bg-blue-500/30 text-blue-300' : 
                          'bg-purple-500/30 text-purple-300'}
                      `}>
                        {cardType}
                      </span>
                      
                      <div className="flex gap-1">
                        {card.damage && (
                          <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-1.5 py-0.5 text-red-300">
                            <Sword className="h-3 w-3" />
                            {card.damage}
                          </span>
                        )}
                        {card.block && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-1.5 py-0.5 text-blue-300">
                            <Shield className="h-3 w-3" />
                            {card.block}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Battle Controls */}
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <div className="h-4 w-4 rounded-full border border-blue-500/50"></div>
                  Draw: {playerDeck.length}
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-4 w-4 rounded-full border border-red-500/50"></div>
                  Discard: {playerDiscardPile.length}
                </span>
              </div>
              <Button 
                onClick={handleEndTurn}
                className="bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600"
                disabled={battleAnimation !== ''}
              >
                End Turn
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}