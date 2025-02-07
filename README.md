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
- Prettier

## Current Features

### Authentication

- Web3 Wallet Connection (MetaMask & Phantom)
- Persistent Authentication State
- Wallet-based User Accounts

### Character System

- Character Creation with Multiple Classes:
  - Warrior (High HP, Defensive Abilities)
  - Mage (Powerful Spells, High Energy)
  - Rogue (Agile, Card Draw Mechanics)
- Experience & Leveling System
- Gold Currency
- Health & Energy Management

### Combat System

- Turn-based Card Combat
- Deck Building Mechanics
- Energy Management
- Status Effects System
- Block & Damage Calculations
- Victory/Defeat Conditions
- Experience & Gold Rewards

### Game Map

- Node-based Progression
- Multiple Node Types:
  - Battle Encounters
  - Merchant Shops
  - Rest Sites
  - Events (Coming Soon)
- Branching Paths

### Shop System

- Purchase Cards & Equipment
- Multiple Item Rarities
- Gold-based Economy

### Rest System

- Health Recovery
- Resource Management

## Upcoming Features

### Combat Enhancements

- More Card Types & Effects
- Combo System
- Elite Enemies & Bosses
- Special Abilities per Class

### Progression

- Talent Trees
- Achievement System
- Character Specializations
- Multiple Save Slots

### Items & Equipment

- Equipment System Expansion
- Crafting System
- Item Rarities & Effects
- Inventory Management

### Social Features

- Leaderboards
- PvP Battles
- Trading System
- Guilds/Clans

### Blockchain Features

- NFT Integration
- Token Rewards
- On-chain Achievements
- Cross-chain Assets

### Content

- New Character Classes
- More Enemy Types
- Additional Card Sets
- Story/Campaign Mode
- Daily Challenges
- Seasonal Events

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
