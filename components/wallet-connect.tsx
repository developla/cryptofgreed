"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { WalletType } from '@prisma/client';
import { useGameStore } from '@/lib/store/game';
import { connectMetaMask } from '@/lib/web3/ethereum';
import { connectPhantom } from '@/lib/web3/solana';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectWallet, disconnectWallet, isConnected, walletAddress, walletType, checkWalletConnection } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    checkWalletConnection();
  }, [checkWalletConnection]);

  const handleConnect = async (type: WalletType) => {
    setIsConnecting(true);
    try {
      let address: string | null = null;

      if (type === WalletType.ETHEREUM) {
        address = await connectMetaMask();
      } else if (type === WalletType.SOLANA) {
        address = await connectPhantom();
      }

      if (!address) {
        throw new Error('Failed to connect wallet');
      }

      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, type }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate wallet');
      }

      const { user } = await response.json();
      connectWallet(address, type);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.success('Wallet disconnected');
    router.push('/');
  };

  if (isConnected && walletAddress) {
    return (
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Connected Wallet</p>
          <p className="font-mono text-sm">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {walletType === WalletType.ETHEREUM ? 'MetaMask' : 'Phantom'}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDisconnect}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <Button
        size="lg"
        onClick={() => handleConnect(WalletType.ETHEREUM)}
        disabled={isConnecting}
        className="w-64"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect with MetaMask
      </Button>
      <Button
        size="lg"
        onClick={() => handleConnect(WalletType.SOLANA)}
        disabled={isConnecting}
        className="w-64"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect with Phantom
      </Button>
    </div>
  );
}