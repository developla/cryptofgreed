import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skull, ArrowLeft, Coins, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  burnNFT,
  getWalletState,
  resetWallet,
  GameNFT,
} from '@/utils/nftUtils';

const GameOver: React.FC = () => {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [nftBurnResult, setNftBurnResult] = useState<string | null>(null);
  const [burnedNFT, setBurnedNFT] = useState<GameNFT | null>(null);
  const [walletState, setWalletState] =
    useState<ReturnType<typeof getWalletState>>(getWalletState());

  // Call NFT burn placeholder on component mount
  useEffect(() => {
    // Get wallet state
    const currentWallet = getWalletState();
    setWalletState(currentWallet);

    // Get invested NFTs from the wallet
    const investedNFTs = currentWallet.equippedNFTs.filter(
      (nft) => nft.isInvested
    );

    if (investedNFTs.length > 0) {
      // Call the burn NFT function to simulate blockchain interaction
      const burnResult = burnNFT(investedNFTs);
      setNftBurnResult(burnResult);

      // Find the burned NFT details for display
      if (burnResult) {
        const nft = investedNFTs.find((nft) => nft.id === burnResult) || null;
        setBurnedNFT(nft);
      }
    } else {
      // Simulate that in testing, we want to invest NFTs automatically
      // In a real implementation, players would choose which NFTs to invest
      if (currentWallet.equippedNFTs.length > 0) {
        // This is just for simulation purposes
        console.log(
          '%c⚠️ No invested NFTs found. In real gameplay, players would choose NFTs to invest.',
          'color: orange;'
        );
      }
    }
  }, []);

  const handleReturnToMenu = () => {
    dispatch({ type: 'NAVIGATE', payload: 'menu' });
  };

  // Simulate payment and revival
  const handleReviveCharacter = () => {
    // Close the payment dialog
    setShowPaymentDialog(false);

    // For testing, always succeed
    const paymentSuccessful = true;

    if (paymentSuccessful) {
      // Revive the character with 50% health
      if (state.activeCharacter) {
        const reviveAmount = Math.floor(state.activeCharacter.maxHealth * 0.5);

        dispatch({
          type: 'HEAL_PLAYER',
          payload: { amount: reviveAmount },
        });

        // Return to map
        dispatch({ type: 'NAVIGATE', payload: 'map' });

        toast({
          title: 'Character Revived!',
          description: `${state.activeCharacter.name} has been revived with ${reviveAmount} HP.`,
          duration: 5000,
        });

        // Simulate blockchain transaction confirmation
        console.log(
          '%c💰 PAYMENT PROCESSED: Revival transaction confirmed',
          'background: #004d00; color: #7fff7f; padding: 2px 5px; border-radius: 3px;'
        );
      }
    } else {
      toast({
        title: 'Revival Failed',
        description:
          'There was an issue processing your payment. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  // Function to show payment dialog
  const openPaymentDialog = () => {
    setShowPaymentDialog(true);
  };

  // Function to reset wallet (for testing only)
  const handleResetWallet = () => {
    resetWallet();
    setWalletState(getWalletState());
    toast({
      title: 'Wallet Reset',
      description: 'NFT wallet has been reset to initial state for testing.',
      duration: 3000,
    });
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="border-b border-red-100 bg-red-50 text-center">
          <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Skull className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">
            Game Over
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 text-center">
          <p className="mb-4 text-gray-700">
            {state.activeCharacter?.name} has fallen in battle!
          </p>

          {/* NFT Burn Result */}
          {burnedNFT ? (
            <div className="my-4 rounded-lg border border-red-100 bg-red-50 p-3">
              <p className="mb-1 text-sm font-bold text-red-700">NFT Burned:</p>
              <div className="mb-2 rounded bg-red-100 p-2">
                <p className="font-semibold">{burnedNFT.name}</p>
                <p className="text-xs">
                  Tier: {burnedNFT.tier} • Type: {burnedNFT.type} • Rarity:{' '}
                  {burnedNFT.rarity}
                </p>
                <div className="mt-1 text-xs">
                  <span className="font-semibold">Stats:</span>
                  {Object.entries(burnedNFT.stats).map(([key, value]) => (
                    <span key={key} className="ml-1">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-red-600">
                This NFT was burned as a result of your defeat. Investing NFTs
                increases difficulty but also rewards.
              </p>
            </div>
          ) : (
            <div className="my-4 rounded-lg border border-amber-100 bg-amber-50 p-3">
              <p className="text-sm text-amber-700">
                No NFTs were burned because you didn't have any invested NFTs.
              </p>
              <p className="mt-1 text-xs text-amber-600">
                In the full game, you can invest NFTs to increase difficulty and
                rewards.
              </p>
            </div>
          )}

          {/* Wallet State */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
            <h3 className="mb-2 text-sm font-bold text-slate-600">
              Current NFT Wallet:
            </h3>
            <div className="space-y-1 text-xs">
              <p>Equipped NFTs: {walletState.equippedNFTs.length}</p>
              <p>Inventory NFTs: {walletState.inventoryNFTs.length}</p>
              <p>Progression SBTs: {walletState.progressionSBTs.length}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full text-xs"
              onClick={handleResetWallet}
            >
              <RefreshCcw className="mr-1 h-3 w-3" />
              Reset Wallet (Testing Only)
            </Button>
          </div>

          <div className="my-6 rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              You can revive your character and continue your adventure, or
              return to the main menu.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={openPaymentDialog}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700"
          >
            <Coins className="mr-2 h-4 w-4" />
            Revive Character (Simulated Payment)
          </Button>

          <Button
            variant="outline"
            onClick={handleReturnToMenu}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Main Menu
          </Button>
        </CardFooter>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revival Payment</DialogTitle>
            <DialogDescription>
              This is a simulation of the payment system that will process real
              payments in the future.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4 text-sm text-gray-500">
              Revival Cost:{' '}
              <span className="font-bold text-amber-600">500 Gold</span>
            </p>

            <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
              In the full implementation, this will connect to a payment
              processor. For now, clicking "Process Payment" will simulate a
              successful payment.
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviveCharacter}
              className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700"
            >
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameOver;
