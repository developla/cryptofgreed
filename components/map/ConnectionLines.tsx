import React from 'react';
import { MapNode } from '@/context/types';

interface ConnectionLinesProps {
  nodes: MapNode[];
}

const ConnectionLines: React.FC<ConnectionLinesProps> = ({ nodes }) => {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      {nodes.map((node) =>
        node.connections.map((targetId) => {
          const target = nodes.find((n) => n.id === targetId);
          if (!target) return null;

          // Only show connections if:
          // 1. Source node is visited AND target node is available OR
          // 2. Both nodes have been visited (to show the path taken)
          if (
            !(node.visited && target.available) &&
            !(node.visited && target.visited)
          ) {
            return null;
          }

          // Determine connection stroke style
          let strokeColor = '#CBD5E0'; // Default color
          let strokeWidth = '2';
          let strokeDasharray = '';

          if (node.visited && target.visited) {
            // Path already traveled
            strokeColor = '#A0AEC0';
            strokeWidth = '3';
          } else if (node.visited && target.available) {
            // Available path
            strokeColor = '#3182CE';
            strokeWidth = '3';
          }

          return (
            <line
              key={`${node.id}-${targetId}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${target.x}%`}
              y2={`${target.y}%`}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
          );
        })
      )}
    </svg>
  );
};

export default ConnectionLines;
