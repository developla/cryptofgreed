import React from 'react';
import MapNode from './map/MapNode';
import ConnectionLines from './map/ConnectionLines';
import MapLegend from './map/MapLegend';
import MapHeader from './map/MapHeader';
import MapLoadingOverlay from './map/MapLoadingOverlay';
import NoPathsWarning from './map/NoPathsWarning';
import { useMapState } from './map/useMapState';
import { NodeType } from '@/context/types';

interface MapProps {
  onNodeSelect: (nodeType: NodeType) => void;
}

const Map: React.FC<MapProps> = ({ onNodeSelect }) => {
  const {
    mapNodes,
    hasAvailableNodes,
    isRegenerating,
    isMapLoading,
    currentNode,
    hasStarted,
    handleRegenerateMap,
    handleNodeSelect,
  } = useMapState();

  // Updated condition: Show warning only if map is loaded, no nodes are available,
  // player has started the journey (clicked at least one node), and not currently regenerating
  const showNoPathsWarning =
    !hasAvailableNodes && mapNodes.length > 0 && !isRegenerating && hasStarted;

  // Show initial guidance message if player hasn't started journey yet
  const showInitialGuidance =
    !hasStarted && mapNodes.length > 0 && !isRegenerating;

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      <MapHeader />

      <MapLoadingOverlay isLoading={isMapLoading} />

      <NoPathsWarning
        show={showNoPathsWarning || showInitialGuidance}
        onRegenerateMap={handleRegenerateMap}
        isRegenerating={isRegenerating}
      />

      <ConnectionLines nodes={mapNodes} />

      {mapNodes.map((node) => (
        <MapNode
          key={node.id}
          id={node.id}
          type={node.type}
          x={node.x}
          y={node.y}
          available={node.available}
          visited={node.visited}
          isCurrentNode={currentNode === node.id}
          onClick={() => handleNodeSelect(onNodeSelect, node.type)}
        />
      ))}

      <MapLegend />
    </div>
  );
};

export default Map;
