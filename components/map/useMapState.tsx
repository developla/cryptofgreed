import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/hooks/use-toast';
import { NodeType } from '@/context/types';

export const useMapState = () => {
  const { state, dispatch } = useGame();
  const { toast } = useToast();

  // Use real map data from state if available
  const mapNodes = state.map?.nodes || [];

  // Check if there are any available and unvisited nodes
  const hasAvailableNodes = mapNodes.some(
    (node) => node.available && !node.visited
  );

  // State to track if map is regenerating to prevent multiple requests
  const [isRegenerating, setIsRegenerating] = useState(false);
  // State to track if the map is loading
  const [isMapLoading, setIsMapLoading] = useState(false);

  // Determine if player has started their journey by checking if any nodes (besides the first) are visited
  const hasStarted =
    mapNodes.length > 0 &&
    mapNodes.some((node, index) => index > 0 && node.visited);

  const handleRegenerateMap = () => {
    if (isRegenerating) return;

    setIsRegenerating(true);
    setIsMapLoading(true);

    toast({
      title: 'Generating New Map',
      description: 'Discovering fresh areas for your adventure...',
      duration: 3000,
    });

    // Add a longer delay to show the loading state with meaningful animation
    setTimeout(() => {
      dispatch({
        type: 'GENERATE_MAP',
        payload: { level: state.activeCharacter?.level || 1 },
      });

      // Reset flags after a short delay to allow the map to render properly
      setTimeout(() => {
        setIsRegenerating(false);
        setIsMapLoading(false);

        // Show success toast after map is fully generated
        toast({
          title: 'Map Generated',
          description: 'New areas are now available to explore!',
          duration: 3000,
        });
      }, 1500);
    }, 1000);
  };

  // Effect to handle case when no available nodes are left
  useEffect(() => {
    // Only show warning if player has started their journey and no more nodes are available
    if (
      state.gamePhase === 'map' &&
      mapNodes.length > 0 &&
      !hasAvailableNodes &&
      hasStarted &&
      !isRegenerating
    ) {
      console.log('No available unvisited nodes found, map needs regeneration');

      toast({
        title: 'Journey Blocked',
        description:
          "You've explored all available paths. Generate a new map to continue.",
        duration: 5000,
      });
    }
  }, [
    state.map,
    state.gamePhase,
    hasAvailableNodes,
    isRegenerating,
    hasStarted,
  ]);

  const handleNodeSelect = (
    onNodeSelect: (nodeType: NodeType) => void,
    nodeType: NodeType
  ) => {
    if (isRegenerating) return;

    // Find a node of the selected type that is available and not visited
    const selectedNode = state.map?.nodes.find(
      (node) => node.type === nodeType && node.available && !node.visited
    );

    if (selectedNode) {
      onNodeSelect(nodeType);
    } else {
      toast({
        title: 'Path Unavailable',
        description: `No ${nodeType} locations are currently accessible.`,
        duration: 3000,
      });
    }
  };

  return {
    mapNodes,
    hasAvailableNodes,
    isRegenerating,
    isMapLoading,
    currentNode: state.map?.currentNode,
    hasStarted,
    handleRegenerateMap,
    handleNodeSelect,
  };
};
