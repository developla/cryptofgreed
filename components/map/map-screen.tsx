"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { useGameStore } from '@/lib/store/game';
import { toast } from 'sonner';
import { MapNodeComponent, type MapNode } from './map-node';

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
      isCompleted: false
    },
    { 
      id: '2', 
      type: 'MERCHANT', 
      x: 300, 
      y: 200, 
      connections: ['4'],
      isAccessible: false,
      isCompleted: false
    },
    { 
      id: '3', 
      type: 'REST', 
      x: 300, 
      y: 400, 
      connections: ['4'],
      isAccessible: false,
      isCompleted: false
    },
    { 
      id: '4', 
      type: 'EVENT', 
      x: 500, 
      y: 300, 
      connections: ['5', '6'],
      isAccessible: false,
      isCompleted: false
    },
    { 
      id: '5', 
      type: 'MERCHANT', 
      x: 700, 
      y: 200, 
      connections: ['7'],
      isAccessible: false,
      isCompleted: false
    },
    { 
      id: '6', 
      type: 'BATTLE', 
      x: 700, 
      y: 400, 
      connections: ['7'],
      isAccessible: false,
      isCompleted: false
    },
    { 
      id: '7', 
      type: 'BATTLE', 
      x: 900, 
      y: 300, 
      connections: [],
      isAccessible: false,
      isCompleted: false
    },
  ];
}

export function MapScreen() {
  const { currentCharacter, isConnected } = useGameStore();
  const router = useRouter();
  const [nodes, setNodes] = useState<MapNode[]>(() => generateMap());

  useEffect(() => {
    if (!isConnected || !currentCharacter) {
      router.push('/');
    }
  }, [isConnected, currentCharacter, router]);

  const updateAccessibleNodes = (currentNodes: MapNode[], completedNodeId: string) => {
    return currentNodes.map(node => {
      if (node.id === completedNodeId) {
        return { ...node, isCompleted: true };
      }
      
      // A node is accessible if it's connected to a completed node
      const isNowAccessible = currentNodes
        .some(n => n.isCompleted && n.connections.includes(node.id));
      
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
        // TODO: Implement random events
        toast.info('Events coming soon!');
        break;
    }

    // Update node accessibility after interaction
    setNodes(prev => updateAccessibleNodes(prev, node.id));
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
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Health</p>
              <p className="font-bold">{currentCharacter.health}/{currentCharacter.maxHealth}</p>
            </Card>
          </div>
        </div>

        <div className="relative w-full h-[600px] border rounded-lg p-4">
          {/* Draw connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodes.map(node =>
              node.connections.map(targetId => {
                const target = nodes.find(n => n.id === targetId);
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
          {nodes.map(node => (
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