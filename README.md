# Project Gamify

A Web3-powered roguelike deck-building game where players can create characters, battle enemies, and earn rewards in a fantasy world. The game features NFT integration for enhanced gameplay and exclusive rewards.

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
- Smart Contract Integration (ERC721)
- NFT-based Game Mechanics

### Backend

- MongoDB (via Prisma ORM)
- Next.js API Routes
- Prisma Client
- HTTP-only Cookie Authentication

### Smart Contracts

- Solidity 0.8.20
- ERC721 Implementation
- Custom Gaming Features
- On-chain Events

## Current Features

### Authentication System

- Email/Password Authentication
- Secure HTTP-only Cookie Sessions
- Password Hashing with bcrypt
- JWT Token Management
- Account Settings Management
- Wallet Connection Integration

### Web3 Integration

- Wallet Connection (MetaMask & Phantom)
- NFT Ownership Verification
- NFT-based Bonus System
- On-chain Event Tracking
- Multi-chain Support
- Wallet Management in Settings

### Character System

- Character Creation with Multiple Classes:
  - Warrior (High HP, Defensive Abilities)
  - Mage (Powerful Spells, High Energy)
  - Rogue (Agile, Card Draw Mechanics)
- Experience & Leveling System
- Gold Currency
- Health & Energy Management
- Equipment System
- Character Stats & Effects

### NFT Features

- NFT-based Bonus System
  - Increased Treasure Rewards
  - Rarity Boost for Items
  - Exclusive Cards
  - Bonus Gold
- On-chain Event Tracking
- NFT Metadata Integration
- Rarity-based Bonuses

### Combat System

- Turn-based Card Combat
- Deck Building Mechanics
- Energy Management
- Status Effects System
- Block & Damage Calculations
- Victory/Defeat Conditions
- Experience & Gold Rewards

### Game Map & Progression

- Node-based Progression
- Multiple Path Options:
  - Battles (Normal/Elite/Boss)
  - Merchant Shops
  - Rest Sites
  - Treasure Rooms
  - Mystery Events
- Dynamic Difficulty Scaling

## Recent Updates

### Authentication Improvements

- Switched to HTTP-only cookie-based authentication
- Enhanced security with JWT token management
- Added account settings page
- Improved error handling and user feedback
- Streamlined login/registration flow

### UI/UX Enhancements

- Added navigation system
- Improved header layout
- Enhanced gear management interface
- Added loading states and animations
- Improved error messaging
- Responsive design improvements

### Battle System Updates

- Enhanced reward calculations
- Improved state management
- Added battle status persistence
- Enhanced victory/defeat handling
- Added character blocking system

### Security Updates

- Implemented secure session management
- Added request validation
- Enhanced error handling
- Improved API route protection
- Added authentication middleware

## Work in Progress

### NFT System Enhancements

- [ ] NFT Minting Interface
- [ ] Token URI Metadata System
- [ ] NFT Staking Mechanics
- [ ] Dynamic Bonus Calculation
- [ ] NFT Trading System
- [ ] Multiple NFT Support
- [ ] Cross-chain NFT Recognition

### Gameplay Features

- [ ] NFT-exclusive Areas
- [ ] Special Events for NFT Holders
- [ ] Enhanced Reward System
- [ ] Collaborative Features
- [ ] PvP Battle System
- [ ] Achievement System
- [ ] Leaderboard Integration

### Smart Contract Updates

- [ ] NFT Staking Contract
- [ ] Reward Distribution System
- [ ] Governance Features
- [ ] Token Integration
- [ ] Battle Verification System
- [ ] Automated Reward Distribution

### Technical Improvements

- [ ] Gas Optimization
- [ ] Contract Security Audits
- [ ] Multi-chain Bridge
- [ ] IPFS Integration
- [ ] Metadata Standards
- [ ] Event Indexing

## Getting Started

1. Clone the repository

```bash
git clone <repository-url>
cd project-gamify
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```env
DATABASE_URL="your_mongodb_url"
NEXT_PUBLIC_RPC_URL="your_ethereum_rpc_url"
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="your_nft_contract_address"
NEXT_PUBLIC_NETWORK="network_name" # mainnet, goerli, etc.
JWT_SECRET="your_jwt_secret"
```

4. Run the development server

```bash
npm run dev
```

## Smart Contract Deployment

1. Deploy the NFT contract

```bash
npx hardhat run scripts/deploy.js --network <network>
```

2. Update the contract address in your environment variables

3. Verify the contract on Etherscan

```bash
npx hardhat verify --network <network> <contract-address>
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the established code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Submit detailed PR descriptions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

Please report any security issues to security@example.com

## Support

For support, please join our Discord community or open an issue on GitHub.
