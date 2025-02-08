'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';
import { WalletType } from '@prisma/client';
import { useGameStore } from '@/lib/store/game';
import { connectMetaMask } from '@/lib/web3/ethereum';
import { connectPhantom } from '@/lib/web3/solana';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

interface WalletConnectProps {
  minimal?: boolean;
  onSuccess?: () => void;
}

export function WalletConnect({ minimal = false, onSuccess }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const {
    connectWallet,
    disconnectWallet,
    isConnected,
    walletAddress,
    walletType,
    emailAuth,
  } = useGameStore();
  const router = useRouter();

  // Wagmi hooks
  const { address } = useAccount();
  const { connect: wagmiConnect } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Handle Ethereum address changes
  useEffect(() => {
    if (address && address !== walletAddress) {
      handleConnect(WalletType.ETHEREUM);
    }
  }, [address, walletAddress]);

  const handleConnect = async (type: WalletType) => {
    if (!emailAuth.token) {
      toast.error('Please login or register first');
      return;
    }

    setIsConnecting(true);
    try {
      let address: string | null = null;

      if (type === WalletType.ETHEREUM) {
        wagmiConnect({ connector: injected() });
        return; // The address change will trigger the useEffect above
      } else if (type === WalletType.SOLANA) {
        address = await connectPhantom();
      }

      if (!address) {
        throw new Error('Failed to connect wallet');
      }

      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${emailAuth.token}`
        },
        body: JSON.stringify({ address, type }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate wallet');
      }

      connectWallet(address, type);
      toast.success('Wallet connected successfully!');
      onSuccess?.();

    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
      setShowOptions(false);
    }
  };

  if (!minimal) {
    return (
      <div className="space-y-4">
        <Button
          size="lg"
          onClick={() => handleConnect(WalletType.ETHEREUM)}
          disabled={isConnecting || !emailAuth.token}
          className="w-full gap-2"
        >
          <Wallet className="h-4 w-4" />
          Connect MetaMask
        </Button>
        <Button
          size="lg"
          onClick={() => handleConnect(WalletType.SOLANA)}
          disabled={isConnecting || !emailAuth.token}
          className="w-full gap-2"
        >
          <Wallet className="h-4 w-4" />
          Connect Phantom
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        size="sm"
        variant={walletAddress ? 'outline' : 'default'}
        onClick={() => setShowOptions(!showOptions)}
        className="gap-2"
        disabled={!emailAuth.token}
      >
        <Wallet className="h-4 w-4" />
        {walletAddress
          ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          : 'Connect Wallet'}
      </Button>

      {showOptions && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-background p-2 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => handleConnect(WalletType.ETHEREUM)}
            disabled={isConnecting}
          >
            <Wallet className="mr-2 h-4 w-4" />
            MetaMask
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => handleConnect(WalletType.SOLANA)}
            disabled={isConnecting}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Phantom
          </Button>
        </div>
      )}
    </div>
  );
}