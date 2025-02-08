'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useGameStore } from '@/lib/store/game';
import { ethers } from 'ethers';
import { Coins, Sparkles, Gift, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import {
  NFT_CONTRACT_ADDRESS,
  getNftPerks,
  applyNftBonusesToTreasure,
} from '@/lib/web3/nft';
import { Progress } from '../ui/progress';

interface TreasureReward {
  gold: number;
  items: any[];
  rarity: number;
}

export function TreasureRoom() {
  const router = useRouter();
  const { currentCharacter, walletAddress, setCharacter } = useGameStore();
  const [isOpening, setIsOpening] = useState(false);
  const [nftBonus, setNftBonus] = useState<number>(0);
  const [reward, setReward] = useState<TreasureReward | null>(null);

  useEffect(() => {
    const checkNftBonus = async () => {
      if (!walletAddress) return;

      try {
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL
        );
        const nftPerks = await getNftPerks(walletAddress, provider);
        setNftBonus(nftPerks.treasureBonus || 0);
      } catch (error) {
        console.error('Failed to check NFT bonus:', error);
      }
    };

    checkNftBonus();
  }, [walletAddress]);

  const handleOpenTreasure = async () => {
    if (!currentCharacter || !walletAddress) return;

    setIsOpening(true);
    try {
      // Base rewards
      const baseRewards = {
        gold: Math.floor(Math.random() * 200) + 100, // 100-300 gold
        items: [],
        rarity: Math.floor(Math.random() * 100), // 0-100 rarity score
      };

      // Get NFT perks and apply bonuses
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const nftPerks = await getNftPerks(walletAddress, provider);
      const finalRewards = applyNftBonusesToTreasure(baseRewards, nftPerks);

      // Update character with rewards
      const response = await fetch('/api/character/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': walletAddress,
        },
        body: JSON.stringify({
          characterId: currentCharacter.id,
          gold: finalRewards.gold,
          experience: 50, // Base XP for opening treasure
        }),
      });

      if (!response.ok) throw new Error('Failed to update character');

      const { character } = await response.json();
      setCharacter(character);
      setReward(finalRewards);

      // Emit blockchain event if using NFT
      if (nftBonus > 0) {
        try {
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            NFT_CONTRACT_ADDRESS,
            [
              'event TreasureOpened(address indexed player, uint256 tokenId, uint256 reward)',
              'function emitTreasureOpened(uint256 tokenId, uint256 reward) external',
            ],
            signer
          );

          // Call the contract method instead of directly emitting
          const tx = await contract.emitTreasureOpened(0, finalRewards.gold);
          const receipt = await tx.wait();

          // Show transaction link
          const networkPrefix =
            process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
              ? ''
              : process.env.NEXT_PUBLIC_NETWORK + '.';
          const txLink = `https://${networkPrefix}etherscan.io/tx/${receipt.hash}`;
          toast.success(
            <div>
              Treasure opened! View transaction:
              <a
                href={txLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-500 hover:underline"
              >
                Etherscan
              </a>
            </div>
          );
        } catch (error) {
          console.error('Failed to emit blockchain event:', error);
          // Still show success toast even if blockchain event fails
          toast.success('Treasure opened successfully!');
        }
      } else {
        toast.success('Treasure opened successfully!');
      }
    } catch (error) {
      console.error('Failed to open treasure:', error);
      toast.error('Failed to open treasure');
    } finally {
      setIsOpening(false);
    }
  };

  const handleContinue = () => {
    router.push('/map');
  };

  if (!currentCharacter) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Treasure Room</h1>
          <p className="text-muted-foreground">
            {nftBonus > 0
              ? `Your NFT grants you ${nftBonus}% bonus to treasure rewards!`
              : 'Open the treasure chest to receive rewards'}
          </p>
        </div>

        {!reward ? (
          <Card className="p-8 text-center">
            <Gift className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
            <h2 className="mb-4 text-2xl font-bold">Mysterious Treasure</h2>
            <p className="mb-6 text-muted-foreground">
              A glowing chest awaits. What riches lie within?
            </p>
            <Button
              size="lg"
              onClick={handleOpenTreasure}
              disabled={isOpening}
              className="gap-2"
            >
              {isOpening ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Opening...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Open Treasure
                </>
              )}
            </Button>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="mb-8 text-center">
              <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
              <h2 className="mb-2 text-2xl font-bold">Treasure Opened!</h2>
              {nftBonus > 0 && (
                <p className="text-sm text-muted-foreground">
                  NFT Bonus Applied: +{nftBonus}%
                </p>
              )}
            </div>

            <div className="mb-8 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold">Gold Found</span>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span>{reward.gold}</span>
                  </div>
                </div>
                <Progress value={Math.min(100, (reward.gold / 1000) * 100)} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold">Rarity Level</span>
                  <span>{reward.rarity}%</span>
                </div>
                <Progress value={reward.rarity} className="bg-primary/20" />
              </div>
            </div>

            <Button onClick={handleContinue} className="w-full">
              Continue Journey
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
