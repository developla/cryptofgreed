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
}

export function WalletConnect({ minimal = false }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const {
    connectWallet,
    disconnectWallet,
    isConnected,
    walletAddress,
    walletType,
    checkWalletConnection,
    setCharacter,
  } = useGameStore();
  const router = useRouter();

  // Wagmi hooks
  const { address } = useAccount();
  const { connect: wagmiConnect } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const initializeWallet = useCallback(async () => {
    try {
      const isConnected = await checkWalletConnection();

      if (isConnected && walletAddress) {
        const response = await fetch('/api/character/get', {
          headers: {
            'x-wallet-address': walletAddress,
          },
        });

        if (response.ok) {
          const { characters } = await response.json();
          if (characters.length === 1) {
            setCharacter(characters[0]);
            router.push('/map');
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [checkWalletConnection, walletAddress, setCharacter, router]);

  useEffect(() => {
    initializeWallet();
  }, [initializeWallet]);

  // Handle Ethereum address changes
  useEffect(() => {
    if (address && address !== walletAddress) {
      handleConnect(WalletType.ETHEREUM);
    }
  }, [address, walletAddress]);

  const handleConnect = async (type: WalletType) => {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, type }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate wallet');
      }

      const { user } = await response.json();
      connectWallet(address, type);
      toast.success('Wallet connected successfully!');
      setShowOptions(false);

      // After connecting, check for existing characters
      const charactersResponse = await fetch('/api/character/get', {
        headers: {
          'x-wallet-address': address,
        },
      });

      if (charactersResponse.ok) {
        const { characters } = await charactersResponse.json();
        if (characters.length === 1) {
          setCharacter(characters[0]);
          router.push('/map');
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (walletType === WalletType.ETHEREUM) {
      wagmiDisconnect();
    }
    disconnectWallet();
    setCharacter(null);
    toast.success('Wallet disconnected');
    router.push('/');
  };

  if (isInitializing) {
    return minimal ? null : (
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="animate-pulse rounded-lg bg-secondary p-4">
          <div className="h-4 w-32 rounded bg-primary/20"></div>
        </div>
      </div>
    );
  }

  if (isConnected && walletAddress) {
    if (minimal) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="gap-2"
        >
          <span className="font-mono text-xs">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <Wallet className="h-4 w-4" />
        </Button>
      );
    }

    return (
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="rounded-lg bg-secondary p-4">
          <p className="text-sm text-muted-foreground">Connected Wallet</p>
          <p className="font-mono text-sm">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {walletType === WalletType.ETHEREUM ? 'MetaMask' : 'Phantom'}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDisconnect}
          className="gap-2"
        >
          <Wallet className="h-4 w-4" />
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  if (minimal) {
    return (
      <div className="relative">
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

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {!showOptions ? (
        <Button
          size="lg"
          onClick={() => setShowOptions(true)}
          className="w-64"
          disabled={isConnecting}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      ) : (
        <div className="flex flex-col gap-4">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOptions(false)}
            className="mt-2"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
