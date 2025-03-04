'use client';
import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import Map from '@/components/Map';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getRandomEnemy } from '@/lib/enemyData';
import { MapPin, ArrowLeft, InfoIcon } from 'lucide-react';
import { NodeType } from '@/context/types';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const MapView: React.FC = () => {
  const { state, dispatch } = useGame();
  const { toast } = useToast();

  useEffect(() => {
    // Generate a new map if one doesn't exist
    if (!state.map) {
      const mapLevel = state.activeCharacter?.level || 1;
      dispatch({ type: 'GENERATE_MAP', payload: { level: mapLevel } });

      // Notify the user
      toast({
        title: 'Journey Begins',
        description: 'A new map has been generated for your adventure!',
        duration: 3000,
      });
    }
  }, [state.gamePhase]);

  if (!state.activeCharacter) {
    return (
      <div className="container px-4 py-8">
        <Card className="p-6 text-center">
          <p>No active character found. Please select or create a character.</p>
          <Button
            onClick={() => dispatch({ type: 'NAVIGATE', payload: 'menu' })}
            className="mt-4"
          >
            Return to Menu
          </Button>
        </Card>
      </div>
    );
  }

  // Show loading state while generating map
  if (!state.map) {
    return (
      <div className="container px-4 py-8">
        <Card className="p-6 text-center">
          <p>Generating a new map for your adventure...</p>
        </Card>
      </div>
    );
  }

  // Count node types for statistics
  const nodeStats = state.map.nodes.reduce(
    (stats, node) => {
      stats[node.type] = (stats[node.type] || 0) + 1;
      return stats;
    },
    {} as Record<NodeType, number>
  );

  const handleNodeSelect = (nodeType: NodeType) => {
    // Find the available node with matching type
    const selectedNode = state.map?.nodes.find(
      (node) => node.type === nodeType && node.available && !node.visited
    );

    if (selectedNode) {
      // Visit the node
      dispatch({
        type: 'VISIT_NODE',
        payload: { nodeId: selectedNode.id },
      });

      // Handle the node encounter based on type
      switch (nodeType) {
        case 'battle':
          // Start a normal battle
          const enemy = getRandomEnemy('basic');
          dispatch({ type: 'START_BATTLE', payload: enemy });
          break;
        case 'elite':
          // Start an elite battle
          const eliteEnemy = getRandomEnemy('elite');
          dispatch({ type: 'START_BATTLE', payload: eliteEnemy });
          break;
        case 'boss':
          // Start a boss battle
          const bossEnemy = getRandomEnemy('boss');
          dispatch({ type: 'START_BATTLE', payload: bossEnemy });
          break;
        case 'shop':
          dispatch({ type: 'NAVIGATE', payload: 'shop' });
          break;
        case 'rest':
          dispatch({ type: 'NAVIGATE', payload: 'rest' });
          break;
        case 'event':
          // For now, just give a random reward
          const gold = Math.floor(Math.random() * 30) + 20;
          toast({
            title: 'Random Event',
            description: `You found ${gold} gold during your travels!`,
            duration: 3000,
          });
          dispatch({
            type: 'HEAL_PLAYER',
            payload: { amount: Math.floor(Math.random() * 10) + 5 },
          });
          // Fixed: Explicitly stay on the map after event instead of returning to home/menu
          // The issue was that we were navigating away but not back to the map
          dispatch({ type: 'NAVIGATE', payload: 'map' });
          break;
      }
    } else {
      // If somehow no node of this type is available, show an error
      toast({
        title: 'Path Blocked',
        description: 'You cannot travel in that direction right now.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  return (
    <div className="container px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Map (Level {state.map.level})</h1>
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'NAVIGATE', payload: 'menu' })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Button>
      </div>

      <div className="glass-card mb-6 rounded-xl p-6">
        <div className="flex w-full items-start justify-between">
          <div className="instructions w-full">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="mb-2 flex items-center">
                <h3 className="font-medium text-blue-800">
                  Journey Instructions
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="ml-2 cursor-help">
                        <InfoIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        The map adapts to your journey! If you're low on health
                        or have faced many battles, you'll find more rest sites
                        and shops to help you recover and prepare.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-blue-700">
                Click on any available node to proceed on your journey. Each
                node represents a different encounter:
              </p>
              <ul className="mt-2 grid list-disc grid-cols-1 gap-1 pl-5 text-sm text-blue-700 md:grid-cols-2">
                <li>Battle nodes - Fight regular enemies</li>
                <li>Elite nodes - Challenging enemies with better rewards</li>
                <li>Rest nodes - Heal and recover</li>
                <li>Shop nodes - Buy cards and items</li>
                <li>Boss nodes - Extremely difficult battles</li>
                <li>Event nodes - Random encounters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Map onNodeSelect={handleNodeSelect} />

      {/* Map Statistics */}
      <div className="mt-4">
        <Card className="bg-slate-50 p-3">
          <div className="text-xs text-slate-600">
            <div className="mb-1 font-medium">Current Map Composition:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(nodeStats).map(([type, count]) => (
                <div key={type} className="rounded border bg-white px-2 py-1">
                  {type}: {count}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MapView;
