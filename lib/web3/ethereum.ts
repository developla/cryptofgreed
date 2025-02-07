import { getAccount } from '@wagmi/core';
import { config } from './config';

export async function connectMetaMask(): Promise<string | null> {
  try {
    const account = await getAccount(config);
    return account.address || null;
  } catch (error) {
    console.error('MetaMask connection error:', error);
    return null;
  }
}