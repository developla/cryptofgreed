"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";
import { WalletType } from "@prisma/client";
import { useGameStore } from "@/lib/store/game";
import { connectMetaMask } from "@/lib/web3/ethereum";
import { connectPhantom } from "@/lib/web3/solana";
import { toast } from "sonner";

export function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectWallet } = useGameStore();

  const handleConnect = async (type: WalletType) => {
    setIsConnecting(true);
    try {
      let address: string | null = null;

      if (type === WalletType.ETHEREUM) {
        address = await connectMetaMask();
      } else if (type === WalletType.SOLANA) {
        address = await connectPhantom();
      }

      console.log("Connect wallet address:", address);

      if (!address) {
        throw new Error("Failed to connect wallet");
      }

      // Save to database
      const response = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, type }),
      });

      console.log("Wallet connection response:", response);

      if (!response.ok) {
        throw new Error("Failed to authenticate wallet");
      }

      const { user } = await response.json();
      connectWallet(address, type);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

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
