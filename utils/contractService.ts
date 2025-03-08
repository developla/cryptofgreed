import { ethers } from 'ethers';
import CryptOfGreedNFT from '@/abi/CryptOfGreedNFT.json';

export class ContractService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer: ethers.Signer;

  constructor(contractAddress: string) {
    this.provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_CORE_RPC_URL);
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);
    this.contract = new ethers.Contract(contractAddress, CryptOfGreedNFT.abi, this.signer);
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