import { ethers } from 'ethers';
import { Interface } from 'ethers';

// For development/testing, you can use a testnet address
// For production, replace with your deployed NFT contract address
export const NFT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

// Define the ABI using Interface format
const NFT_CONTRACT_ABI = new Interface([
  // ERC721 standard functions
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',

  // Gaming-specific functions
  'function getTokenRarity(uint256 tokenId) view returns (uint8)',
  'function getTokenBonus(uint256 tokenId) view returns (uint256)',

  // Events
  'event TreasureOpened(address indexed player, uint256 tokenId, uint256 reward)',
  'function emitTreasureOpened(uint256 tokenId, uint256 reward) external',
]);

export async function checkNftOwnership(
  walletAddress: string,
  provider: ethers.Provider
): Promise<boolean> {
  try {
    const contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );

    const balance = await contract.balanceOf(walletAddress);
    return balance > 0;
  } catch (error) {
    console.error('Failed to check NFT ownership:', error);
    return false;
  }
}

export interface NftPerks {
  starterDeck?: string[];
  bonusGold?: number;
  exclusiveCards?: string[];
  cosmeticSkins?: string[];
  treasureBonus?: number;
  rarityBoost?: number;
}

export async function getNftPerks(
  walletAddress: string,
  provider: ethers.Provider
): Promise<NftPerks> {
  try {
    const hasNft = await checkNftOwnership(walletAddress, provider);
    if (!hasNft) return {};

    const contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );

    // Get token IDs owned by the wallet
    const balance = await contract.balanceOf(walletAddress);
    const perks: NftPerks = {
      bonusGold: 1000,
      treasureBonus: 50, // 50% more treasure rewards
      rarityBoost: 20, // 20% higher chance for rare items
      starterDeck: ['Legendary Sword', 'Divine Shield', 'Ancient Scroll'],
      exclusiveCards: ['Phoenix Form', 'Time Warp', 'Celestial Blessing'],
      cosmeticSkins: ['Golden Warrior', 'Ethereal Mage', 'Shadow Rogue'],
    };

    // Calculate additional bonuses based on NFT rarity
    for (let i = 0; i < Number(balance); i++) {
      try {
        const rarity = await contract.getTokenRarity(i);
        const bonus = await contract.getTokenBonus(i);

        // Add rarity-based bonuses
        perks.treasureBonus! += Number(rarity) * 10; // Each rarity level adds 10% to treasure finds
        perks.bonusGold! += Number(bonus); // Add token-specific gold bonus
      } catch (error) {
        console.error(`Error getting token ${i} details:`, error);
      }
    }

    return perks;
  } catch (error) {
    console.error('Failed to get NFT perks:', error);
    return {};
  }
}

// Helper function to apply NFT bonuses to treasure rewards
export function applyNftBonusesToTreasure(
  baseRewards: {
    gold?: number;
    items?: any[];
    rarity?: number;
  },
  nftPerks: NftPerks
): {
  gold: number;
  items: any[];
  rarity: number;
} {
  const rewards = { ...baseRewards };

  if (nftPerks.treasureBonus && rewards.gold) {
    rewards.gold = Math.floor(
      rewards.gold * (1 + nftPerks.treasureBonus / 100)
    );
  }

  if (nftPerks.rarityBoost && rewards.rarity) {
    rewards.rarity = Math.min(
      100,
      rewards.rarity * (1 + nftPerks.rarityBoost / 100)
    );
  }

  return {
    gold: rewards.gold || 0,
    items: rewards.items || [],
    rarity: rewards.rarity || 0,
  };
}
