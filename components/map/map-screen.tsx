"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useGameStore } from '@/lib/store/game';
import { Sword, ShoppingBag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface MapNode {
  id: string;
  type: 'BATTLE' | 'MERCHANT' | 'EVENT';
  x: number;
  y: number;
  connections: string[];
}

const MOCK_MAP: MapNode[] = [
  { id: '1', type: 'BATTLE', x: 100, y: 100, connections: ['2', '3'] },
  { id: '2', type: 'MERCHANT', x: 300, y: 50, connections: ['4'] },
  { id: '3', type: 'EVENT', x: 300, y: 150, connections: ['4'] },
  { id: '4', type: 'BATTLE', x: 500, y: 100, connections: [] },
];

const NODE_ICONS = {
  BATTLE: Sword,
  MERCHANT: ShoppingBag,
  EVENT: Sparkles,
};

export function MapScreen() {
  const { currentCharacter, isConnected } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected || !currentCharacter) {
      router.push('/');
    }
  }, [isConnected, currentCharacter, router]);

  const handleNodeClick = async (node: MapNode) => {
    switch (node.type) {
      case 'BATTLE':
        try {
          // Ensure enemies are seeded before starting battle
          await fetch('/api/enemy/seed', { method: 'POST' });
          router.push('/battle');
        } catch (error) {
          console.error('Failed to prepare battle:', error);
          toast.error('Failed to start battle. Please try again.');
        }
        break;
      case 'MERCHANT':
        // TODO: Implement merchant screen
        break;
      case 'EVENT':
        // TODO: Implement event screen
        break;
    }
  };

  if (!currentCharacter) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">The Crypto Spire</h1>
          <div className="flex items-center gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Character</p>
              <p className="font-bold">{currentCharacter.name}</p>
              <p className="text-sm">Level {currentCharacter.level}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Gold</p>
              <p className="font-bold">{currentCharacter.gold}</p>
            </Card>
          </div>
        </div>

        <div className="relative w-full h-[600px] border rounded-lg p-4">
          {/* Draw connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {MOCK_MAP.map(node =>
              node.connections.map(targetId => {
                const target = MOCK_MAP.find(n => n.id === targetId);
                if (!target) return null;
                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeWidth="2"
                  />
                );
              })
            )}
          </svg>

          {/* Draw nodes */}
          {MOCK_MAP.map(node => {
            const Icon = NODE_ICONS[node.type];
            return (
              <Button
                key={node.id}
                variant="outline"
                className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ left: node.x, top: node.y }}
                onClick={() => handleNodeClick(node)}
              >
                <Icon className="w-6 h-6" />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}