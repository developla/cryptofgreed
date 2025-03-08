import { ethers } from 'ethers';
import CryptOfGreedNFT from '@/abi/CryptOfGreedNFT.json';

// This service should only be used in API routes or server components
export class ContractService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer: ethers.Signer;

  constructor(contractAddress: string) {
    // This will only work in API routes or server components
    if (typeof window !== 'undefined') {
      throw new Error('ContractService should only be instantiated on the server side');
    }

    if (!process.env.PRIVATE_KEY) {
      throw new Error('Private key is not configured in server environment');
    }

    try {
      this.provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_CORE_RPC_URL);
      
      let privateKey = process.env.PRIVATE_KEY.trim();
      if (!privateKey.startsWith('0x')) {
        privateKey = `0x${privateKey}`;
      }

      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(contractAddress, CryptOfGreedNFT.abi, this.signer);
    } catch (error) {
      console.error('ContractService initialization error:', error);
      throw error;
    }
  }

  async mintGameItem(playerAddress: string, uri: string, tier: string): Promise<number> {
    try {
      const tx = await this.contract.mintGameItem(playerAddress, uri, tier);
      const receipt = await tx.wait();
      const event = receipt.events.find((e: any) => e.event === 'Transfer');
      return Number(event.args.tokenId);
    } catch (error) {
      console.error('Error minting game item:', error);
      throw error;
    }
  }

  async investToken(tokenId: number): Promise<void> {
    try {
      const tx = await this.contract.investToken(tokenId);
      await tx.wait();
    } catch (error) {
      console.error('Error investing token:', error);
      throw error;
    }
  }

  async burnToken(tokenId: number): Promise<void> {
    try {
      const tx = await this.contract.burnToken(tokenId);
      await tx.wait();
    } catch (error) {
      console.error('Error burning token:', error);
      throw error;
    }
  }
}
