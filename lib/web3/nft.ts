{
  `import { ethers } from 'ethers';
import { type ContractInterface } from 'ethers';

const NFT_CONTRACT_ADDRESS = '0x...'; // Replace with actual contract address

// Define the ABI with proper typing
const NFT_CONTRACT_ABI: ContractInterface = [
  // ERC721 standard functions
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: 'owner', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Add other contract functions as needed
];

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
    return balance.gt(0);
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
}

export async function getNftPerks(
  walletAddress: string,
  provider: ethers.Provider
): Promise<NftPerks> {
  try {
    const hasNft = await checkNftOwnership(walletAddress, provider);
    if (!hasNft) return {};

    // In a real implementation, these would be fetched from the NFT metadata
    return {
      starterDeck: ['Legendary Sword', 'Divine Shield', 'Ancient Scroll'],
      bonusGold: 1000,
      exclusiveCards: ['Phoenix Form', 'Time Warp', 'Celestial Blessing'],
      cosmeticSkins: ['Golden Warrior', 'Ethereal Mage', 'Shadow Rogue'],
    };
  } catch (error) {
    console.error('Failed to get NFT perks:', error);
    return {};
  }
}`;
}
