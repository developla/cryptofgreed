"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store/game";
import { WalletType } from "@prisma/client";
import { Wallet } from "lucide-react";

export function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectWallet } = useGameStore();

  const handleConnect = async (type: WalletType) => {
    setIsConnecting(true);
    try {
      if (type === WalletType.ETHEREUM) {
        // TODO: Implement MetaMask connection
        const address = "0x..."; // Placeholder
        connectWallet(address, type);
      } else if (type === WalletType.SOLANA) {
        // TODO: Implement Phantom connection
        const address = "..."; // Placeholder
        connectWallet(address, type);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
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