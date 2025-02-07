"use client";

import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useGameStore } from '@/lib/store/game';
import { Shield, Sword } from 'lucide-react';
import { toast } from 'sonner';

export function BattleScreen() {
  const {
    currentCharacter,
    currentEnemy,
    playerHand,
    playerDeck,
    playerDiscardPile,
    drawCard,
    playCard,
    discardHand,
    endBattle
  } = useGameStore();

  const [energy, setEnergy] = useState(currentCharacter?.energy || 0);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [enemyIntent, setEnemyIntent] = useState<string>('');

  useEffect(() => {
    // Draw initial hand
    for (let i = 0; i < 5; i++) {
      drawCard();
    }
    // Set initial energy
    setEnergy(currentCharacter?.maxEnergy || 0);
    // Set enemy's first move
    determineEnemyIntent();
  }, []);

  const determineEnemyIntent = () => {
    if (!currentEnemy) return;
    
    const move = currentEnemy.moves[Math.floor(Math.random() * currentEnemy.moves.length)];
    setEnemyIntent(move.description);
  };

  const handlePlayCard = (cardIndex: number) => {
    const card = playerHand[cardIndex];
    if (energy < card.energyCost) {
      toast.error('Not enough energy!');
      return;
    }

    // Apply card effects
    if (card.damage) {
      let damage = card.damage;
      if (enemyBlock > 0) {
        const remainingBlock = enemyBlock - damage;
        if (remainingBlock > 0) {
          setEnemyBlock(remainingBlock);
          damage = 0;
        } else {
          setEnemyBlock(0);
          damage = -remainingBlock;
        }
      }
      // TODO: Apply damage to enemy
    }

    if (card.block) {
      setPlayerBlock(prev => prev + card.block);
    }

    // Apply card effects
    card.effects?.forEach(effect => {
      // TODO: Implement effect system
    });

    playCard(cardIndex);
    setEnergy(prev => prev - card.energyCost);
  };

  const handleEndTurn = () => {
    // Enemy's turn
    if (currentEnemy) {
      // TODO: Apply enemy move
      determineEnemyIntent();
    }

    // Reset for next turn
    discardHand();
    for (let i = 0; i < 5; i++) {
      drawCard();
    }
    setEnergy(currentCharacter?.maxEnergy || 0);
  };

  if (!currentCharacter || !currentEnemy) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-4">
      {/* Enemy Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">{currentEnemy.name}</h2>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>{enemyBlock}</span>
          </div>
        </div>
        <Progress value={(currentEnemy.health / currentEnemy.maxHealth) * 100} className="mb-2" />
        <div className="text-sm text-muted-foreground">
          Intent: {enemyIntent}
        </div>
      </div>

      {/* Player Section */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{currentCharacter.name}</h2>
            <Progress 
              value={(currentCharacter.health / currentCharacter.maxHealth) * 100} 
              className="w-48"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>{playerBlock}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                {energy}
              </div>
              <span className="text-sm text-muted-foreground">Energy</span>
            </div>
          </div>
        </div>

        {/* Hand */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {playerHand.map((card, index) => (
            <Card
              key={card.id}
              className="p-2 w-32 shrink-0 cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => handlePlayCard(index)}
            >
              <div className="text-sm font-bold mb-1">{card.name}</div>
              <div className="text-xs text-muted-foreground mb-2">
                {card.description}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>{card.type}</span>
                <span>{card.energyCost} Energy</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Deck Info */}
        <div className="flex justify-between items-center">
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