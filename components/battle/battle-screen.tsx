"use client";

import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useGameStore } from "@/lib/store/game";
import { Shield, Sword } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ENEMY_TEMPLATES, type EnemyTemplate } from "@/lib/game/enemies";
import {
  calculateDamage,
  applyCardEffects,
  type BattleState,
} from "@/lib/game/battle";

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
  } = useGameStore();

  const [battleState, setBattleState] = useState<BattleState>({
    playerHealth: currentCharacter?.health || 0,
    playerBlock: 0,
    playerEnergy: currentCharacter?.maxEnergy || 0,
    playerEffects: [],
    enemyHealth: 0,
    enemyBlock: 0,
    enemyEffects: [],
  });

  const [currentEnemy, setCurrentEnemy] = useState<EnemyTemplate | null>(null);
  const [enemyIntent, setEnemyIntent] = useState<string>("");
  const [currentMove, setCurrentMove] = useState<any>(null);

  useEffect(() => {
    if (!currentCharacter) {
      router.push("/");
      return;
    }

    // Initialize battle
    const randomEnemy =
      Object.values(ENEMY_TEMPLATES)[
        Math.floor(Math.random() * Object.values(ENEMY_TEMPLATES).length)
      ];
    setCurrentEnemy(randomEnemy);
    setBattleState((prev) => ({
      ...prev,
      playerHealth: currentCharacter.health,
      playerEnergy: currentCharacter.maxEnergy,
      enemyHealth: randomEnemy.health,
    }));

    // Start battle and draw initial hand
    startBattle();
    for (let i = 0; i < 5; i++) {
      drawCard();
    }

    determineEnemyIntent();
  }, [currentCharacter, router, drawCard, startBattle]);

  const determineEnemyIntent = () => {
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
  };

  const handlePlayCard = async (cardIndex: number) => {
    const card = playerHand[cardIndex];
    if (!card || !currentEnemy) return;

    if (battleState.playerEnergy < card.energy) {
      toast.error("Not enough energy!");
      return;
    }

    let newState = { ...battleState };

    // Calculate and apply damage
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

    // Apply block
    if (card.block) {
      newState = {
        ...newState,
        playerBlock: newState.playerBlock + card.block,
        playerEnergy: newState.playerEnergy - card.energy,
      };
    }

    // Apply card effects
    if (card.effects) {
      newState = applyCardEffects(card.effects, newState, true);
    }

    // Update state
    await setBattleState(newState);
    playCard(cardIndex);

    // Check for victory after state update
    if (newState.enemyHealth <= 0) {
      handleVictory();
    }
  };

  const handleEnemyTurn = () => {
    if (!currentEnemy || !currentMove) return;

    let newState = { ...battleState };

    // Apply enemy damage
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

    // Apply enemy block
    if (currentMove.block) {
      newState = {
        ...newState,
        enemyBlock: newState.enemyBlock + currentMove.block,
      };
    }

    // Apply enemy effects
    if (currentMove.effects) {
      newState = applyCardEffects(currentMove.effects, newState, false);
    }

    setBattleState(newState);

    // Check for defeat after state update
    if (newState.playerHealth <= 0) {
      handleDefeat();
    }
  };

  const handleEndTurn = () => {
    // Enemy's turn
    handleEnemyTurn();

    // Reset for next turn
    discardHand();
    for (let i = 0; i < 5; i++) {
      drawCard();
    }

    setBattleState((prev) => ({
      ...prev,
      playerEnergy: currentCharacter?.maxEnergy || 0,
      playerBlock: 0, // Block resets each turn
      enemyBlock: 0, // Enemy block also resets each turn
    }));

    determineEnemyIntent();
  };

  const handleVictory = () => {
    toast.success("Victory!");
    const goldReward = Math.floor(Math.random() * 30) + 20; // Random gold between 20-50
    toast.success(`Earned ${goldReward} gold!`);
    endBattle();
    router.push("/map");
  };

  const handleDefeat = () => {
    toast.error("Defeat!");
    endBattle();
    router.push("/map");
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
            <span>{battleState.enemyBlock}</span>
          </div>
        </div>
        <Progress
          value={(battleState.enemyHealth / currentEnemy.maxHealth) * 100}
          className="mb-2"
        />
        <div className="text-sm text-muted-foreground">
          Intent: {enemyIntent}
        </div>
        {/* Debug info */}
        <div className="text-sm text-muted-foreground mt-2">
          Enemy Health: {battleState.enemyHealth}/{currentEnemy.maxHealth}
        </div>
      </div>

      {/* Player Section */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{currentCharacter.name}</h2>
            <Progress
              value={
                (battleState.playerHealth / currentCharacter.maxHealth) * 100
              }
              className="w-48"
            />
            {/* Debug info */}
            <div className="text-sm text-muted-foreground">
              Health: {battleState.playerHealth}/{currentCharacter.maxHealth}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>{battleState.playerBlock}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                {battleState.playerEnergy}
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
                <span>{card.energy} Energy</span>
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
