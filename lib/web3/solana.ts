import { Connection, PublicKey } from '@solana/web3.js';

export async function connectPhantom(): Promise<string | null> {
  try {
    const { solana } = window as any;
    
    if (!solana?.isPhantom) {
      throw new Error('Phantom wallet not found!');
    }

    const resp = await solana.connect();
    return resp.publicKey.toString();
  } catch (error) {
    console.error('Phantom connection error:', error);
    return null;
  }
}