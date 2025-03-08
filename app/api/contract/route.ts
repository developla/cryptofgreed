import { NextResponse } from 'next/server';
import { ContractService } from '@/utils/contractService';

export async function POST(request: Request) {
  try {
    const contractService = new ContractService(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!);
    const { action, playerAddress, uri, tier, tokenId } = await request.json();

    switch (action) {
      case 'mint':
        const newTokenId = await contractService.mintGameItem(playerAddress, uri, tier);
        return NextResponse.json({ success: true, tokenId: newTokenId });

      case 'invest':
        await contractService.investToken(tokenId);
        return NextResponse.json({ success: true });

      case 'burn':
        await contractService.burnToken(tokenId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Contract API error:', error);
    return NextResponse.json({ error: 'Contract interaction failed' }, { status: 500 });
  }
}
