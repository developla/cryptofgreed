'use client';
import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import Battle from '@/components/Battle';
import { getRandomEnemy } from '@/lib/enemyData';
import { getRandomCard } from '@/lib/cardData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CardComponent from '@/components/Card';
import { useToast } from '@/hooks/use-toast';

// Helper function to determine enemy type based on level
const getEnemyTypeByLevel = (level: number): 'basic' | 'elite' | 'boss' => {
  if (level >= 7 && level % 7 === 0) {
    return 'boss';
  } else if (level >= 3 && level % 3 === 0) {
    return 'elite';
  } else {
    return 'basic';
  }
};

const BattlePage: React.FC = () => {
  const { state, dispatch } = useGame();
  const { inBattle, gamePhase, activeCharacter, currentEnemy, inBattleMode } =
    state;
  const { toast } = useToast();
  // Add a state to track if a card has been selected to prevent multiple selections
  const [selectedCard, setSelectedCard] = useState<boolean>(false);
  // Store the generated card reward
  const [cardReward, setCardReward] = useState<any>(null);
  // Track experience reward to prevent duplicate rewards
  const [experienceAwarded, setExperienceAwarded] = useState<boolean>(false);

  // Make sure inBattleMode is set if we're in battle
  useEffect(() => {
    if (inBattle && !inBattleMode) {
      console.log('Setting battle mode ON due to active battle state');
      dispatch({
        type: 'START_BATTLE',
        payload: currentEnemy || getRandomEnemy('basic'),
      });
    }
  }, [inBattle, inBattleMode, currentEnemy, dispatch]);

  // Start a battle if there's no active battle but we're in battle mode
  useEffect(() => {
    if (
      gamePhase === 'battle' &&
      !inBattle &&
      !currentEnemy &&
      activeCharacter
    ) {
      // If we're in battle mode but no battle is active, start one
      console.log('No active battle found in battle mode, starting new battle');

      // Determine enemy type based on character level
      const enemyType = getEnemyTypeByLevel(activeCharacter.level);
      const enemy = getRandomEnemy(enemyType);

      // Show toast message for boss battles
      if (enemyType === 'boss') {
        toast({
          title: 'Boss Battle!',
          description: `You've encountered a powerful boss: ${enemy.name}`,
          variant: 'destructive',
        });
      }

      dispatch({ type: 'START_BATTLE', payload: enemy });
    }
  }, [gamePhase, inBattle, currentEnemy, activeCharacter, dispatch, toast]);

  // Handle experience gain for reward screen
  useEffect(() => {
    if (
      gamePhase === 'reward' &&
      activeCharacter &&
      currentEnemy &&
      !experienceAwarded
    ) {
      const experienceGained = Math.floor(currentEnemy.maxHealth * 0.5);

      // Add gold reward based on enemy type
      let goldReward = Math.floor(currentEnemy.maxHealth * 0.2);

      // Bonus gold for elite and boss enemies
      if (currentEnemy.name.includes('Elite')) {
        goldReward *= 2;
      } else if (currentEnemy.name.includes('Boss')) {
        goldReward *= 5;
      }

      if (experienceGained > 0) {
        // Mark experience as awarded to prevent duplicate rewards
        setExperienceAwarded(true);

        dispatch({
          type: 'END_BATTLE',
          payload: {
            experience: experienceGained,
            gold: goldReward,
          },
        });

        toast({
          title: 'Battle Rewards',
          description: `You gained ${experienceGained} experience and ${goldReward} gold!`,
        });
      }
    }
  }, [
    gamePhase,
    activeCharacter,
    currentEnemy,
    dispatch,
    toast,
    experienceAwarded,
  ]);

  // Generate a card reward only once when entering the reward screen
  useEffect(() => {
    if (gamePhase === 'reward' && !cardReward) {
      setCardReward(getRandomCard());
      // Reset the selected state when entering reward screen
      setSelectedCard(false);
    }
  }, [gamePhase, cardReward]);

  // Reset states when leaving reward screen
  useEffect(() => {
    if (gamePhase !== 'reward') {
      setCardReward(null);
      setSelectedCard(false);
      setExperienceAwarded(false);
    }
  }, [gamePhase]);

  // Handle card reward selection
  const handleSelectReward = (card: any) => {
    // Prevent multiple selections
    if (selectedCard) return;

    setSelectedCard(true);
    dispatch({ type: 'ADD_CARD_TO_DECK', payload: card });

    toast({
      title: 'Card Added',
      description: `${card.name} has been added to your deck.`,
    });

    // Delay the navigation to map to show the toast message
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE', payload: 'map' });
    }, 1000);
  };

  // Render card rewards when battle is completed
  if (gamePhase === 'reward' && activeCharacter && cardReward) {
    return (
      <div className="container px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Card className="p-6">
            <h2 className="mb-6 text-center text-2xl font-bold">Victory!</h2>
            <p className="mb-6 text-center">
              Choose a card to add to your deck:
            </p>

            <div className="mb-6 flex justify-center">
              <CardComponent
                card={cardReward}
                onClick={() => !selectedCard && handleSelectReward(cardReward)}
                className={selectedCard ? 'cursor-not-allowed opacity-50' : ''}
              />
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => dispatch({ type: 'NAVIGATE', payload: 'map' })}
                className="game-primary-button"
              >
                Return to Map
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gamePhase === 'game-over' && activeCharacter) {
    return (
      <div className="container px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Card className="p-6">
            <h2 className="mb-6 text-center text-2xl font-bold">Game Over</h2>
            <p className="mb-6 text-center">
              Your adventure has come to an end.
            </p>

            <div className="flex justify-center">
              <Button
                onClick={() => dispatch({ type: 'NAVIGATE', payload: 'menu' })}
                className="game-primary-button"
              >
                Return to Menu
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Render battle if in progress
  if (inBattle && activeCharacter && currentEnemy) {
    return <Battle />;
  }

  // If no battle is active and we're not in reward screen, initiate a battle automatically
  return (
    <div className="container flex items-center justify-center px-4 py-8">
      <Card className="max-w-md p-6">
        <h2 className="mb-4 text-center text-xl font-bold">
          Preparing for Battle
        </h2>
        <p className="mb-6 text-center">
          Get ready to fight your next opponent!
        </p>

        <div className="flex justify-center">
          <Button
            onClick={() => {
              if (activeCharacter) {
                const enemyType = getEnemyTypeByLevel(activeCharacter.level);
                const enemy = getRandomEnemy(enemyType);
                dispatch({ type: 'START_BATTLE', payload: enemy });
              }
            }}
            className="game-primary-button"
          >
            Start Battle
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BattlePage;
