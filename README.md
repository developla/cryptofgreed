# Crypt of Greed - Card-Based Roguelike Game

A dark fantasy card-based roguelike game where players battle through dungeons, collect treasure, and face increasingly difficult enemies.

## Project Overview

Crypt of Greed is a single-player card game that combines elements of deck-building, roguelike progression, and turn-based combat. Players create a character, build their deck of cards, and venture through a procedurally generated dungeon filled with enemies, treasures, and events.

## Features

- **Character Creation**: Create and customize your hero with different classes
- **Deck Building**: Collect and manage cards to build a powerful deck
- **Turn-Based Combat**: Strategic combat system using cards for attacks, defense, and special abilities
- **Roguelike Progression**: Permadeath with persistent unlocks between runs
- **Item Shop**: Buy new cards, potions, and equipment to enhance your character
- **Inventory System**: Manage collected items during your adventure
- **Core DAO & NFT Integration**: Blockchain-based progression system with NFT rewards and SBTs

## Architecture

The project is built with the following technologies:

- Nextjs 15
- TypeScript
- Tailwind CSS
- ShadCN UI Component Library

### Data Storage

Currently, the game uses localStorage for data persistence. Here's how the data is structured:

```javascript
{
  "characters": [...],     // Player characters data
  "activeCharacter": {...}, // Currently selected character
  "gamePhase": "...",      // Current game phase
  "user": {...},           // User account data
  // Other game state properties
}
```

### Future Database Integration

For future database integration, we've prepared a simple data synchronization utility. This will enable a smooth transition from localStorage to a proper database.

```typescript
/**
 * Simulates syncing localStorage data with a database
 */
export const syncWithDatabase = async () => {
  try {
    // Get data from localStorage
    const gameData = JSON.parse(
      localStorage.getItem('cryptOfGreedData') || '{}'
    );

    // Log the sync attempt (will be replaced with API call)
    console.log('Syncing with database:', gameData);

    // Success placeholder
    return true;
  } catch (error) {
    console.error('Database sync error:', error);
    return false;
  }
};

/**
 * Simulates loading data from database to localStorage
 */
export const loadFromDatabase = async (userId: string) => {
  try {
    console.log('Loading data for user:', userId);

    // In the future, this would fetch from a real database
    return true;
  } catch (error) {
    console.error('Database load error:', error);
    return false;
  }
};
```

When implementing a full database solution, consider:

1. **User Authentication**: Secure login/signup with JWT
2. **Real-time Syncing**: Periodic sync between localStorage and database
3. **Offline Support**: Continue gameplay when offline, sync when connection returns
4. **Data Validation**: Ensure data integrity before saving to prevent exploits

## Core DAO Integration

Crypt of Greed features a groundbreaking integration with the Core DAO blockchain, providing players with true ownership of in-game assets through NFTs (Non-Fungible Tokens) and SBTs (Soulbound Tokens). This integration enables a play-to-own model where game progress and achievements have tangible value.

### NFT Progression System

The game implements an innovative NFT progression system that includes:

- **Starting Gear NFTs**: New players receive T0-tier equipment NFTs that serve as their starting gear
- **NFT Tiers**: Equipment NFTs range from T0 (starter) to T5 (legendary), with increasing stats and abilities
- **NFT Investment**: Players can "invest" their NFTs to increase difficulty and potential rewards
- **Risk/Reward Mechanics**: Invested NFTs provide better rewards but risk permanent loss upon defeat

### Core DAO Features

The Core DAO integration (implemented in `nftUtils.ts`) includes:

- **NFT Minting**: New equipment is minted as NFTs after victories
- **Tiered Progression**: NFTs can be upgraded from T0 to T5 through gameplay
- **Soulbound Tokens (SBTs)**: Achievement tokens that track player progression
- **Difficulty Modifiers**: Players can stake their NFTs to modify game difficulty
- **Burn Mechanics**: Invested NFTs may be permanently lost (burned) upon defeat

### Technical Implementation

The current implementation in `nftUtils.ts` provides simulated blockchain interactions for:

- `assignStartingGear()`: Creates T0 NFTs for new players
- `handleNFTProgression()`: Manages NFT rewards and burning based on battle outcomes
- `applyDifficultyModifiers()`: Adjusts difficulty and rewards based on invested NFTs
- `generateVictoryRewards()`: Creates NFT and SBT rewards upon victory
- `upgradeNFT()`: Progresses NFTs through the tier system
- `burnNFT()`: Removes invested NFTs from player wallet upon defeat

For the hackathon implementation, these simulated blockchain interactions demonstrate the core gameplay mechanics while preparing for future integration with actual Core DAO smart contracts.

### Future Blockchain Extensions

Planned extensions to the Core DAO integration include:

- **Smart Contract Integration**: Converting simulated functions to actual blockchain transactions
- **Marketplace Integration**: Allowing players to trade their game NFTs
- **Cross-Game Asset Utilization**: Enabling NFTs to be used across multiple compatible games
- **DAO Governance**: Allowing players to vote on game updates and features
- **Community Rewards**: Distributing rewards to active community members

## Game Flow

1. **Character Creation**: Player creates a new character
2. **Map Navigation**: Player navigates through the dungeon map
3. **Encounters**: Player faces enemies, shops, rest areas, and events
4. **Combat**: Turn-based card combat with strategic decisions
5. **Rewards**: Player earns gold, cards, items, and NFTs after victories
6. **Progression**: Character levels up, gaining stronger abilities
7. **Death or Victory**: Run ends with character death or dungeon completion

## Development

This project is developed using Vite, React, and TypeScript. To run the project locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
