
import { v4 as uuidv4 } from 'uuid';
import { GameMap, MapNode, NodeType } from '../types';
import { shuffleArray } from './commonUtils';

export const MAX_NODES = 15;

export const calculateNodeType = (nodeIndex: number): NodeType => {
  // Special case for the first node - always a rest site
  if (nodeIndex === 0) {
    return 'rest';
  }
  
  // Special case for the final node - always a boss
  if (nodeIndex === MAX_NODES - 1) {
    return 'boss';
  }
  
  // Determine node type based on random chance
  const rand = Math.random();
  
  // Increase elite encounter rate as the map progresses
  const eliteChance = 0.1 + (nodeIndex / MAX_NODES) * 0.15;
  // Rest sites appear more often in the middle of the map
  const restChance = 0.15 - Math.abs((nodeIndex / MAX_NODES) - 0.5) * 0.1;
  // Event chance stays relatively constant
  const eventChance = 0.2;
  // Shop chance increases slightly as the map progresses
  const shopChance = 0.1 + (nodeIndex / MAX_NODES) * 0.05;
  
  if (rand < eliteChance) {
    return 'elite';
  } else if (rand < eliteChance + restChance) {
    return 'rest';
  } else if (rand < eliteChance + restChance + eventChance) {
    return 'event';
  } else if (rand < eliteChance + restChance + eventChance + shopChance) {
    return 'shop';
  } else {
    return 'battle';
  }
};

// Function to generate a map (for map reducer)
export const generateMap = (level: number, playerHealth?: { current: number, max: number }): GameMap => {
  const nodes: MapNode[] = [];
  
  // Calculate health ratio for dynamic balancing
  const healthRatio = playerHealth ? playerHealth.current / playerHealth.max : 1;
  
  // Generate nodes with improved positioning
  for (let i = 0; i < MAX_NODES; i++) {
    // Adjust node type distribution based on player health
    let nodeType: NodeType;
    
    if (i === MAX_NODES - 1) {
      // Last node is always boss
      nodeType = 'boss';
    } else if (i === 0) {
      // First node is always a rest site
      nodeType = 'rest';
    } else {
      const rand = Math.random();
      
      // If player health is low, increase chance of rest sites and shops
      if (healthRatio < 0.4) {
        if (rand < 0.3) nodeType = 'rest';
        else if (rand < 0.5) nodeType = 'shop';
        else if (rand < 0.7) nodeType = 'battle';
        else if (rand < 0.85) nodeType = 'event';
        else nodeType = 'elite';
      } else {
        // Normal distribution
        if (rand < 0.45) nodeType = 'battle';
        else if (rand < 0.6) nodeType = 'event';
        else if (rand < 0.75) nodeType = 'shop';
        else if (rand < 0.9) nodeType = 'rest';
        else nodeType = 'elite';
      }
    }
    
    // Improved positioning logic for a better visual layout
    // Create a more structured, progressive map layout with 5 rows
    const row = Math.floor(i / 3);  // 3 nodes per row, 5 rows total
    
    // Calculate y-position: distribute rows evenly from top to bottom
    const yPos = 12 + (row * 17);  // Start at 12% from top, each row takes 17% of height
    
    // Calculate x-position: distribute nodes within each row
    const columnInRow = i % 3;  // Which column in the current row (0, 1, or 2)
    
    // Nodes in odd rows are offset horizontally for a more natural path
    const rowOffset = row % 2 === 0 ? 0 : 10;
    const xPos = 20 + rowOffset + (columnInRow * 25);  // Space nodes horizontally with 25% gap
    
    // Add small random variation to prevent perfectly aligned grid
    const xVariation = Math.random() * 6 - 3;  // +/- 3%
    const yVariation = Math.random() * 4 - 2;  // +/- 2%
    
    nodes.push({
      id: uuidv4(),
      type: nodeType,
      x: Math.max(15, Math.min(85, xPos + xVariation)),  // Constrain between 15-85%
      y: Math.max(10, Math.min(90, yPos + yVariation)),  // Constrain between 10-90%
      connections: [],
      visited: i === 0,  // First node is visited by default
      available: i === 0  // First node is available by default
    });
  }
  
  // Create connections with improved algorithm
  // Connect each node to 1-2 nodes in the next row
  for (let row = 0; row < 4; row++) {  // 4 rows of connections (5 rows of nodes)
    for (let col = 0; col < 3; col++) {  // 3 nodes per row
      const nodeIndex = row * 3 + col;
      const node = nodes[nodeIndex];
      
      // Choose how many connections (1-2)
      const connectionCount = 1 + Math.floor(Math.random() * 2);
      
      // Connect to 1-2 nodes in the next row
      const nextRowIndices = [0, 1, 2].map(i => (row + 1) * 3 + i);
      const possibleTargets = nextRowIndices.filter(i => i < nodes.length);
      
      // Shuffle and take first 1-2 elements
      const shuffled = shuffleArray(possibleTargets);
      const targets = shuffled.slice(0, connectionCount);
      
      // Add connections
      targets.forEach(targetIndex => {
        node.connections.push(nodes[targetIndex].id);
        
        // IMPORTANT FIX: Make connected nodes in the second row available from the start
        if (row === 0) {
          nodes[targetIndex].available = true;
        }
      });
    }
  }
  
  // Always ensure there's at least one viable path to the boss
  // Create a "golden path" from start to finish
  for (let row = 0; row < 4; row++) {  // Connect through all 5 rows
    const currentRowStart = row * 3;
    const nextRowStart = (row + 1) * 3;
    
    // Choose a random node from current row and connect to random node in next row
    // if it doesn't already have a connection
    const sourceIndex = currentRowStart + Math.floor(Math.random() * 3);
    const targetIndex = nextRowStart + Math.floor(Math.random() * 3);
    
    if (sourceIndex < nodes.length && targetIndex < nodes.length) {
      const source = nodes[sourceIndex];
      const target = nodes[targetIndex];
      
      // Add connection if it doesn't exist
      if (!source.connections.includes(target.id)) {
        source.connections.push(target.id);
        
        // IMPORTANT FIX: Make connected nodes in the second row available from the start
        if (sourceIndex < 3) {
          target.available = true;
        }
      }
    }
  }
  
  console.log('Generated map with', nodes.length, 'nodes and ensured a path to boss');
  
  // Validate there's a path from start to boss
  let hasPath = false;
  const visited = new Set<string>();
  
  const checkPath = (nodeId: string, targetId: string): boolean => {
    if (nodeId === targetId) return true;
    if (visited.has(nodeId)) return false;
    
    visited.add(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return false;
    
    for (const connId of node.connections) {
      if (checkPath(connId, targetId)) return true;
    }
    
    return false;
  };
  
  if (nodes.length > 0) {
    const startNode = nodes[0].id;
    const bossNode = nodes[nodes.length - 1].id;
    hasPath = checkPath(startNode, bossNode);
    
    if (!hasPath) {
      console.log('No path to boss detected, fixing...');
      // Create a direct path if none exists
      for (let i = 0; i < nodes.length - 1; i += 3) {
        const current = nodes[i];
        const next = nodes[Math.min(i + 3, nodes.length - 1)];
        current.connections.push(next.id);
        
        // IMPORTANT FIX: If we're creating connections from first row, make second row nodes available
        if (i === 0) {
          next.available = true;
        }
      }
    }
  }
  
  // FINAL CHECK: Ensure at least one node in the second row is available
  const secondRowNodes = nodes.slice(3, 6);
  const hasAvailableSecondRowNode = secondRowNodes.some(node => node.available);
  
  if (!hasAvailableSecondRowNode && secondRowNodes.length > 0) {
    // Make at least one second row node available
    secondRowNodes[Math.floor(Math.random() * secondRowNodes.length)].available = true;
    console.log('Made a second row node available to ensure playability');
  }
  
  return {
    nodes,
    level,
    currentNode: nodes[0].id
  };
};
