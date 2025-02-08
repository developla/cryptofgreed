import { getAccount, connect } from '@wagmi/core';
import { injected } from 'wagmi/connectors';
import { config } from './config';

export async function connectMetaMask(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('MetaMask not available');
    }

    const result = await connect(config, {
      connector: injected(),
    });

    if (!result.accounts[0]) {
      throw new Error('No accounts found');
    }

    return result.accounts[0];
  } catch (error) {
    console.error('MetaMask connection error:', error);
    return null;
  }
}
