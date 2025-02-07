"use client";

import { Button } from "../ui/button";
import { Sword, ShoppingBag, Sparkles, Tent } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <Button
      variant={node.isCompleted ? "secondary" : "outline"}
      className={cn(
        "absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full",
        !node.isAccessible && "opacity-50 cursor-not-allowed",
        node.isCompleted && "bg-primary/20"
      )}
      style={{ left: node.x, top: node.y }}
      onClick={() => node.isAccessible && onClick(node)}
      disabled={!node.isAccessible}
    >
      <Icon className="w-6 h-6" />
    </Button>
  );
}