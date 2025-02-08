"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useGameStore } from "@/lib/store/game";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { type EnemyTemplate } from "@/lib/game/enemies";
import {
  calculateDamage,
  applyCardEffects,
  type BattleState,
  type StatusEffect,
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
    walletAddress,
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
  const [enemyIntent, setEnemyIntent] = useState("");
  const [currentMove, setCurrentMove] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentCharacter || !walletAddress) {
      router.push("/");
      return;
    }

    const initializeBattle = async () => {
      try {
        setIsLoading(true);
        // Fetch a scaled enemy based on character level
        const response = await fetch(
          `/api/enemy/get?level=${currentCharacter.level}`,
          {
            headers: {
              "x-wallet-address": walletAddress,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch enemy");

        const { enemy } = await response.json();
        setCurrentEnemy(enemy);
        setBattleState({
          playerHealth: currentCharacter.health,
          playerBlock: 0,
          playerEnergy: currentCharacter.maxEnergy,
          playerEffects: [],
          enemyHealth: enemy.health,
          enemyBlock: 0,
          enemyEffects: [],
        });

        // Start battle and draw initial hand
        startBattle();
        for (let i = 0; i < 5; i++) {
          drawCard();
        }

        determineEnemyIntent();
      } catch (error) {
        console.error("Failed to initialize battle:", error);
        toast.error("Failed to start battle");
        router.push("/map");
      } finally {
        setIsLoading(false);
      }
    };

    initializeBattle();
  }, [currentCharacter, router, drawCard, startBattle, walletAddress]);

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
    setBattleState(newState);
    playCard(cardIndex);

    // Check for victory after state update
    if (newState.enemyHealth <= 0) {
      await handleVictory();
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

  const handleVictory = async () => {
    if (!currentCharacter || !currentEnemy || !walletAddress) return;

    try {
      const goldReward =
        Math.floor(
          Math.random() *
            (currentEnemy.goldReward.max - currentEnemy.goldReward.min + 1)
        ) + currentEnemy.goldReward.min;

      const response = await fetch("/api/character/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": walletAddress,
        },
        body: JSON.stringify({
          characterId: currentCharacter.id,
          experience: currentEnemy.experienceReward,
          gold: goldReward,
          health: battleState.playerHealth,
        }),
      });

      if (!response.ok) throw new Error("Failed to update character");

      toast.success("Victory!");
      toast.success(
        `Earned ${goldReward} gold and ${currentEnemy.experienceReward} experience!`
      );
      endBattle();
      router.push("/map");
    } catch (error) {
      console.error("Failed to process victory:", error);
      toast.error("Failed to update rewards");
    }
  };

  const handleDefeat = async () => {
    if (!walletAddress) return;

    try {
      await fetch("/api/character/block", {
        method: "POST",
        headers: {
          "x-wallet-address": walletAddress,
        },
      });

      toast.error(
        "Defeat! Your character has been blocked from further battles."
      );
      endBattle();
      router.push("/map");
    } catch (error) {
      console.error("Failed to process defeat:", error);
      toast.error("Failed to update character status");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-4 flex items-center justify-center">
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-primary/20 rounded w-3/4"></div>
            <div className="h-8 bg-primary/10 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

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
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
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
              key={index}
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
