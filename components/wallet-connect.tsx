'use client';

import { useState } from 'react';

declare global {
  interface Window {
    solana?: {
      disconnect: () => Promise<void>;
    };
  }
}
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';
import { WalletType } from '@prisma/client';
import { useGameStore } from '@/lib/store/game';
import { connectMetaMask } from '@/lib/web3/ethereum';
import { connectPhantom } from '@/lib/web3/solana';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface WalletConnectProps {
  minimal?: boolean;
  onSuccess?: () => void;
}

export function WalletConnect({
  minimal = false,
  onSuccess,
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const {
    connectWallet,
    disconnectWallet,
    isConnected,
    walletAddress,
    walletType,
  } = useGameStore();
  const router = useRouter();

  const handleConnect = async (type: WalletType) => {
    setIsConnecting(true);
    try {
      let address: string | null = null;

      // Connect to the appropriate wallet
      if (type === WalletType.ETHEREUM) {
        if (typeof window.ethereum === 'undefined') {
          throw new Error('MetaMask is not installed');
        }
        address = await connectMetaMask();
      } else if (type === WalletType.SOLANA) {
        if (typeof window.solana === 'undefined') {
          throw new Error('Phantom wallet is not installed');
        }
        address = await connectPhantom();
      }

      if (!address) {
        throw new Error('Failed to connect wallet');
      }

      // Link wallet to user account
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address, type }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to authenticate wallet');
      }

      // Update local state
      connectWallet(address, type);
      toast.success('Wallet connected successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to connect wallet'
      );
    } finally {
      setIsConnecting(false);
      setShowOptions(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsConnecting(true);

      // Disconnect from wallet provider
      if (walletType === WalletType.ETHEREUM && window.ethereum) {
        window.ethereum.removeAllListeners();
      } else if (walletType === WalletType.SOLANA && window.solana) {
        await window.solana.disconnect();
      }

      // Remove wallet from user account
      const response = await fetch('/api/auth/wallet/disconnect', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disconnect wallet');
      }

      // Update local state
      disconnectWallet();
      toast.success('Wallet disconnected successfully');
      router.refresh(); // Refresh the page to update UI
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to disconnect wallet'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  if (!minimal) {
    return (
      <div className="space-y-4">
        {walletAddress ? (
          <Button
            size="lg"
            variant="destructive"
            onClick={handleDisconnect}
            disabled={isConnecting}
            className="w-full gap-2"
          >
            <Wallet className="h-4 w-4" />
            {isConnecting
              ? 'Disconnecting...'
              : `Disconnect ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              onClick={() => handleConnect(WalletType.ETHEREUM)}
              disabled={isConnecting}
              className="w-full gap-2"
            >
              <Wallet className="h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
            <Button
              size="lg"
              onClick={() => handleConnect(WalletType.SOLANA)}
              disabled={isConnecting}
              className="w-full gap-2"
            >
              <Wallet className="h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect Phantom'}
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {walletAddress ? (
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDisconnect}
          disabled={isConnecting}
          className="gap-2"
        >
          <Wallet className="h-4 w-4" />
          {isConnecting
            ? 'Disconnecting...'
            : `Disconnect ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
        </Button>
      ) : (
        <>
          <Button
            size="sm"
            onClick={() => setShowOptions(!showOptions)}
            className="gap-2"
          >
            <Wallet className="h-4 w-4" />
            Connect Wallet
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
                {isConnecting ? 'Connecting...' : 'MetaMask'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleConnect(WalletType.SOLANA)}
                disabled={isConnecting}
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Phantom'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
