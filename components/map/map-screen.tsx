'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useGameStore } from '@/lib/store/game';
import { toast } from 'sonner';
import { MapNodeComponent, type MapNode } from './map-node';
import { Users } from 'lucide-react';

// Generate a simple branching path
function generateMap(): MapNode[] {
  return [
    {
      id: '1',
      type: 'BATTLE',
      x: 100,
      y: 300,
      connections: ['2', '3'],
      isAccessible: true,
      isCompleted: false,
    },
    {
      id: '2',
      type: 'MERCHANT',
      x: 300,
      y: 200,
      connections: ['4'],
      isAccessible: false,
      isCompleted: false,
    },
    {
      id: '3',
      type: 'REST',
      x: 300,
      y: 400,
      connections: ['4'],
      isAccessible: false,
      isCompleted: false,
    },
    {
      id: '4',
      type: 'EVENT',
      x: 500,
      y: 300,
      connections: ['5', '6'],
      isAccessible: false,
      isCompleted: false,
    },
    {
      id: '5',
      type: 'MERCHANT',
      x: 700,
      y: 200,
      connections: ['7'],
      isAccessible: false,
      isCompleted: false,
    },
    {
      id: '6',
      type: 'BATTLE',
      x: 700,
      y: 400,
      connections: ['7'],
      isAccessible: false,
      isCompleted: false,
    },
    {
      id: '7',
      type: 'BATTLE',
      x: 900,
      y: 300,
      connections: [],
      isAccessible: false,
      isCompleted: false,
    },
  ];
}

export function MapScreen() {
  const { currentCharacter, isConnected, walletAddress, setCharacter } =
    useGameStore();
  const router = useRouter();
  const [nodes, setNodes] = useState<MapNode[]>(() => generateMap());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !currentCharacter) {
      router.push('/');
    }
  }, [isConnected, currentCharacter, router]);

  const updateAccessibleNodes = (
    currentNodes: MapNode[],
    completedNodeId: string
  ) => {
    return currentNodes.map((node) => {
      if (node.id === completedNodeId) {
        return { ...node, isCompleted: true };
      }

      const isNowAccessible = currentNodes.some(
        (n) => n.isCompleted && n.connections.includes(node.id)
      );

      if (isNowAccessible && !node.isAccessible) {
        return { ...node, isAccessible: true };
      }

      return node;
    });
  };

  const handleNodeClick = async (node: MapNode) => {
    switch (node.type) {
      case 'BATTLE':
        try {
          await fetch('/api/enemy/seed', { method: 'POST' });
          router.push('/battle');
        } catch (error) {
          console.error('Failed to prepare battle:', error);
          toast.error('Failed to start battle. Please try again.');
        }
        break;
      case 'MERCHANT':
        router.push('/shop');
        break;
      case 'REST':
        router.push('/rest');
        break;
      case 'EVENT':
        toast.info('Events coming soon!');
        break;
    }

    setNodes((prev) => updateAccessibleNodes(prev, node.id));
  };

  const handleSwitchCharacter = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/character/get', {
        headers: {
          'x-wallet-address': walletAddress,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch characters');

      const { characters } = await response.json();
      if (characters.length > 0) {
        setCharacter(null); // Clear current character
        router.push('/'); // Go to character selection
      }
    } catch (error) {
      console.error('Failed to switch character:', error);
      toast.error('Failed to load characters');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentCharacter) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">The Crypto Spire</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitchCharacter}
            disabled={isLoading}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Switch Character
          </Button>
        </div>

        <div className="relative h-[600px] w-full rounded-lg border p-4">
          {/* Draw connections */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {nodes.map((node) =>
              node.connections.map((targetId) => {
                const target = nodes.find((n) => n.id === targetId);
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
          {nodes.map((node) => (
            <MapNodeComponent
              key={node.id}
              node={node}
              onClick={handleNodeClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
