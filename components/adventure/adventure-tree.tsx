'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useGameStore } from '@/lib/store/game';
import {
  Sword,
  ShoppingBag,
  Tent,
  Skull,
  Crown,
  CircleDot,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Node {
  id: string;
  type: 'START' | 'BATTLE' | 'ELITE' | 'SHOP' | 'REST' | 'BOSS' | 'END';
  completed: boolean;
  available: boolean;
}

interface Path {
  from: string;
  to: string;
}

const TOTAL_ENCOUNTERS = 7;

export function AdventureTree() {
  const router = useRouter();
  const { currentCharacter } = useGameStore();
  const [currentNode, setCurrentNode] = useState<string>('start');
  const [progress, setProgress] = useState(0);

  const nodes: Node[] = [
    { id: 'start', type: 'START', completed: true, available: true },
    { id: 'battle1', type: 'BATTLE', completed: false, available: true },
    { id: 'shop1', type: 'SHOP', completed: false, available: false },
    { id: 'elite1', type: 'ELITE', completed: false, available: false },
    { id: 'rest1', type: 'REST', completed: false, available: false },
    { id: 'battle2', type: 'BATTLE', completed: false, available: false },
    { id: 'shop2', type: 'SHOP', completed: false, available: false },
    { id: 'boss', type: 'BOSS', completed: false, available: false },
    { id: 'end', type: 'END', completed: false, available: false },
  ];

  const paths: Path[] = [
    { from: 'start', to: 'battle1' },
    { from: 'battle1', to: 'shop1' },
    { from: 'battle1', to: 'elite1' },
    { from: 'shop1', to: 'rest1' },
    { from: 'elite1', to: 'rest1' },
    { from: 'rest1', to: 'battle2' },
    { from: 'battle2', to: 'shop2' },
    { from: 'shop2', to: 'boss' },
    { from: 'boss', to: 'end' },
  ];

  useEffect(() => {
    // Calculate progress based on completed nodes
    const completedCount = nodes.filter((node) => node.completed).length;
    setProgress((completedCount / TOTAL_ENCOUNTERS) * 100);
  }, [nodes]);

  const getNodeIcon = (type: Node['type']) => {
    switch (type) {
      case 'START':
        return <CircleDot className="h-6 w-6" />;
      case 'BATTLE':
        return <Sword className="h-6 w-6" />;
      case 'ELITE':
        return <Skull className="h-6 w-6 text-red-400" />;
      case 'SHOP':
        return <ShoppingBag className="h-6 w-6 text-blue-400" />;
      case 'REST':
        return <Tent className="h-6 w-6 text-green-400" />;
      case 'BOSS':
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 'END':
        return <CircleDot className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const handleNodeClick = (node: Node) => {
    if (!node.available) return;

    switch (node.type) {
      case 'BATTLE':
      case 'ELITE':
      case 'BOSS':
        router.push('/battle');
        break;
      case 'SHOP':
        router.push('/shop');
        break;
      case 'REST':
        router.push('/rest');
        break;
    }
  };

  if (!currentCharacter) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Adventure Progress</h2>
          <p className="text-sm text-muted-foreground">
            Complete 7 encounters to reach the final boss
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">Progress</p>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      <div className="relative min-h-[400px] overflow-x-auto">
        <svg
          className="absolute inset-0"
          style={{ width: '100%', height: '100%' }}
        >
          {paths.map((path, index) => (
            <line
              key={index}
              x1="0"
              y1="0"
              x2="0"
              y2="0"
              className="stroke-primary/20"
              strokeWidth="2"
            />
          ))}
        </svg>

        <div className="grid grid-cols-3 gap-4 p-4">
          {nodes.map((node) => (
            <Card
              key={node.id}
              className={`cursor-pointer p-4 transition-all ${
                node.available
                  ? 'hover:scale-105 hover:bg-primary/10'
                  : 'opacity-50'
              } ${node.completed ? 'bg-primary/20' : ''}`}
              onClick={() => handleNodeClick(node)}
            >
              <div className="flex items-center gap-3">
                {getNodeIcon(node.type)}
                <div>
                  <p className="font-medium">
                    {node.type.charAt(0) + node.type.slice(1).toLowerCase()}
                  </p>
                  {node.completed && (
                    <p className="text-sm text-muted-foreground">Completed</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}