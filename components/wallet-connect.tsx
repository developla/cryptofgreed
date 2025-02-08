"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";
import { WalletType } from "@prisma/client";
import { useGameStore } from "@/lib/store/game";
import { connectMetaMask } from "@/lib/web3/ethereum";
import { connectPhantom } from "@/lib/web3/solana";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function WalletConnect() {
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

  // Initial wallet check and setup
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const isConnected = await checkWalletConnection();

        if (isConnected && walletAddress) {
          // Fetch character data if wallet is connected
          const response = await fetch("/api/character/get", {
            headers: {
              "x-wallet-address": walletAddress,
            },
          });

          if (response.ok) {
            const { character } = await response.json();
            if (character) {
              setCharacter(character);
              router.push("/map");
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize wallet:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeWallet();
  }, []);

  // Set up wallet event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAccountsChanged = async () => {
      await checkWalletConnection();
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnectWallet();
      router.push("/");
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("disconnect", handleDisconnect);
    }

    if (window.solana) {
      window.solana.on("disconnect", handleDisconnect);
      window.solana.on("accountChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      }

      if (window.solana) {
        window.solana.removeListener("disconnect", handleDisconnect);
        window.solana.removeListener("accountChanged", handleAccountsChanged);
      }
    };
  }, [checkWalletConnection, disconnectWallet, router]);

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
        throw new Error("Failed to connect wallet");
      }

      const response = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, type }),
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate wallet");
      }

      const { user } = await response.json();
      connectWallet(address, type);
      toast.success("Wallet connected successfully!");
      setShowOptions(false);
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.success("Wallet disconnected");
    router.push("/");
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="bg-secondary p-4 rounded-lg animate-pulse">
          <div className="h-4 w-32 bg-primary/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (isConnected && walletAddress) {
    return (
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Connected Wallet</p>
          <p className="font-mono text-sm">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {walletType === WalletType.ETHEREUM ? "MetaMask" : "Phantom"}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDisconnect}
          className="gap-2"
        >
          <Wallet className="w-4 h-4" />
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
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
