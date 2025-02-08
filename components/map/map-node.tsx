import { Button } from '../ui/button';
import { Sword, ShoppingBag, Sparkles, Tent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export type NodeType = 'BATTLE' | 'MERCHANT' | 'EVENT' | 'REST';

export interface MapNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  connections: string[];
  isAccessible: boolean;
  isCompleted: boolean;
}

const NODE_ICONS = {
  BATTLE: Sword,
  MERCHANT: ShoppingBag,
  EVENT: Sparkles,
  REST: Tent,
};

interface MapNodeProps {
  node: MapNode;
  onClick: (node: MapNode) => void;
}

export function MapNodeComponent({ node, onClick }: MapNodeProps) {
  const Icon = NODE_ICONS[node.type];
  const router = useRouter();

  const handleClick = async () => {
    if (!node.isAccessible) return;

    switch (node.type) {
      case 'BATTLE':
        try {
          await fetch('/api/enemy/seed', { method: 'POST' });
          router.push('/battle');
        } catch (error) {
          console.error('Failed to prepare battle:', error);
        }
        break;
      case 'MERCHANT':
        router.push('/shop');
        break;
      case 'REST':
        router.push('/rest');
        break;
      case 'EVENT':
        // Handle event nodes when implemented
        break;
    }

    onClick(node);
  };

  return (
    <Button
      variant={node.isCompleted ? 'secondary' : 'outline'}
      className={cn(
        'absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200',
        !node.isAccessible && 'cursor-not-allowed opacity-50',
        node.isCompleted && 'bg-primary/20',
        node.isAccessible &&
          !node.isCompleted &&
          'hover:scale-110 hover:bg-primary/20'
      )}
      style={{ left: node.x, top: node.y }}
      onClick={handleClick}
      disabled={!node.isAccessible}
    >
      <Icon className="h-6 w-6" />
    </Button>
  );
}
