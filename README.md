# Project Gamify

A Web3-powered roguelike deck-building game where players can create characters, battle enemies, and earn rewards in a fantasy world.

## Tech Stack

### Frontend

- Next.js 13.5 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- Zustand (State Management)
- Lucide React (Icons)

### Web3 Integration

- Wagmi (Ethereum Integration)
- @solana/web3.js (Solana Integration)
- Multi-chain Support (Ethereum & Solana)

### Backend

- MongoDB (via Prisma ORM)
- Next.js API Routes
- Prisma Client

### Development Tools

- ESLint
- TypeScript
- Prettier with Tailwind CSS Plugin
- Format on Save Configuration

## Current Features

### Authentication

- Web3 Wallet Connection (MetaMask & Phantom)
- Persistent Authentication State
- Wallet-based User Accounts
- Account Blocking System for Battle Violations

### Character System

- Character Creation with Multiple Classes:
  - Warrior (High HP, Defensive Abilities)
  - Mage (Powerful Spells, High Energy)
  - Rogue (Agile, Card Draw Mechanics)
- Experience & Leveling System
- Gold Currency
- Health & Energy Management
- Equipment System with Multiple Slots
- Character Stats & Effects

### Combat System

- Turn-based Card Combat
- Deck Building Mechanics
- Energy Management
- Status Effects System
- Block & Damage Calculations
- Victory/Defeat Conditions
- Experience & Gold Rewards
- Persistent Battle State
- Original Deck Preservation

### Game Map & Path System

- Node-based Progression
- Branching Paths with Multiple Options:
  - Normal Battles
  - Elite Encounters
  - Boss Fights
  - Merchant Shops
  - Rest Sites
  - Treasure Rooms
  - Mystery Events
- Dynamic Difficulty Scaling
- Path Selection Based on Level

### Shop System

- Purchase Cards & Equipment
- Multiple Item Rarities
- Gold-based Economy
- Equipment Effects

### Rest System

- Health Recovery
- Resource Management
- Card Upgrades (Coming Soon)

## Code Quality & Development

### Formatting & Style

- Prettier Configuration:
  - Semi-colons enabled
  - Single quotes
  - 2-space indentation
  - ES5 trailing commas
  - 80 character print width
  - Tailwind CSS class sorting
- ESLint Integration
- VSCode Settings for Consistent Formatting
- Automatic Format on Save

### Development Experience

- Hot Module Replacement
- Type Safety
- Component Architecture
- State Management Best Practices
- Error Handling & Recovery
- Performance Optimizations

## Pending Features

### Combat Enhancements

- Elite Enemy Mechanics
- Boss Battle System
- Special Abilities per Class
- Combo System
- Card Synergies
- Status Effect Visualizations
- Battle Animations

### Progression System

- Talent Trees
- Skill Points
- Character Specializations
- Achievement System
- Multiple Save Slots
- Prestige System

### Items & Equipment

- Crafting System
- Item Rarities & Effects
- Equipment Set Bonuses
- Inventory Management
- Item Enhancement
- Rare Collectibles

### Social Features

- Leaderboards
- PvP Battles
- Trading System
- Guilds/Clans
- Friend System
- Chat Integration

### Blockchain Features

- NFT Integration
- Token Rewards
- On-chain Achievements
- Cross-chain Assets
- Smart Contract Integration
- Decentralized Storage

### Content Expansion

- New Character Classes
- Additional Card Sets
- More Enemy Types
- Story/Campaign Mode
- Daily Challenges
- Seasonal Events
- World Map Expansion
- Quest System

### Quality of Life

- Tutorial System
- Settings Menu
- Audio System
- Visual Effects
- Mobile Responsiveness
- Offline Support
- Save/Load System

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```env
DATABASE_URL="your_mongodb_url"
```

4. Run the development server:

```bash
npm run dev
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
