// NFT Progression System Utility Functions
// These simulate a blockchain-connected system for testing purposes

export type NFTProgressionOutcome = 'victory' | 'defeat';
export type NFTTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

export interface GameNFT {
  id: string;
  name: string;
  tier: NFTTier;
  type: 'gear' | 'weapon' | 'armor' | 'accessory';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: {
    [key: string]: number;
  };
  imageUrl?: string;
  isInvested?: boolean;
}

export interface ProgressionSBT {
  id: string;
  level: number;
  achievements: string[];
  dateIssued: string;
}

export interface DifficultyModifier {
  id: string;
  name: string;
  description: string;
  rewardMultiplier: number;
  riskMultiplier: number;
}

/**
 * Assign starting T0 gear to new players
 * Simulates minting NFTs
 */
export const assignStartingGear = (): GameNFT[] => {
  console.log('%c🏁 MINTING STARTING GEAR NFTs', 'background: #004d00; color: #7fff7f; padding: 2px 5px; border-radius: 3px;');
  
  // Generate unique IDs using timestamp and random values
  const startingGear: GameNFT[] = [
    {
      id: `weapon-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: 'Trainee Sword',
      tier: 'T0',
      type: 'weapon',
      rarity: 'common',
      stats: {
        damage: 5,
        durability: 100
      },
      isInvested: false
    },
    {
      id: `armor-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: 'Novice Chestplate',
      tier: 'T0',
      type: 'armor',
      rarity: 'common',
      stats: {
        defense: 3,
        durability: 100
      },
      isInvested: false
    },
    {
      id: `accessory-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: 'Apprentice Ring',
      tier: 'T0',
      type: 'accessory',
      rarity: 'common',
      stats: {
        luck: 2,
        charisma: 1
      },
      isInvested: false
    }
  ];
  
  console.log('%c🏁 STARTING GEAR CREATED:', 'color: #004d00;', startingGear);
  return startingGear;
};

// Mock NFT wallet for testing purposes
let playerWallet: {
  equippedNFTs: GameNFT[];
  inventoryNFTs: GameNFT[];
  progressionSBTs: ProgressionSBT[];
} = {
  equippedNFTs: [],
  inventoryNFTs: [],
  progressionSBTs: []
};

// Initialize wallet with starting gear
if (playerWallet.equippedNFTs.length === 0) {
  playerWallet.equippedNFTs = assignStartingGear();
}

/**
 * Handle NFT progression based on battle outcome
 * Simulates actual blockchain operations for testing
 */
export const handleNFTProgression = (outcome: NFTProgressionOutcome, playerLevel: number): void => {
  console.log(`%c🔗 BLOCKCHAIN SIMULATION: NFT Progression triggered for ${outcome}`, 'background: #222; color: #bada55; padding: 2px 5px; border-radius: 3px;');
  
  // Simulate blockchain transaction delay
  setTimeout(() => {
    try {
      if (outcome === 'victory') {
        // Generate rewards
        const { difficultyMultiplier, rewardMultiplier } = applyDifficultyModifiers(
          [{ id: 'default', name: 'Standard', description: 'Standard difficulty', rewardMultiplier: 1, riskMultiplier: 1 }],
          playerWallet.equippedNFTs.filter(nft => nft.isInvested)
        );
        
        // Generate rewards based on victory
        const rewards = generateVictoryRewards(playerLevel, rewardMultiplier);
        
        // Add NFT to wallet
        if (rewards.nft) {
          playerWallet.inventoryNFTs.push(rewards.nft);
          console.log(`%c🎁 NFT MINTED: ${rewards.nft.name} (${rewards.nft.tier})`, 'background: #004d00; color: #7fff7f; padding: 2px 5px; border-radius: 3px;');
        }
        
        // Add SBT to wallet
        if (rewards.sbt) {
          playerWallet.progressionSBTs.push(rewards.sbt);
          console.log(`%c📜 SBT GRANTED: Level ${rewards.sbt.level} progression token`, 'background: #00008b; color: #add8e6; padding: 2px 5px; border-radius: 3px;');
        }
        
        // Upgrade lowest tier NFT
        if (playerWallet.equippedNFTs.length > 0) {
          const lowestTierNFT = [...playerWallet.equippedNFTs].sort((a, b) => {
            const tierOrder = { 'T0': 0, 'T1': 1, 'T2': 2, 'T3': 3, 'T4': 4, 'T5': 5 };
            return tierOrder[a.tier] - tierOrder[b.tier];
          })[0];
          
          const upgradedNFT = upgradeNFT(lowestTierNFT);
          
          // Replace the old NFT with the upgraded one
          playerWallet.equippedNFTs = playerWallet.equippedNFTs.map(nft => 
            nft.id === lowestTierNFT.id ? upgradedNFT : nft
          );
          
          console.log(`%c⬆️ NFT UPGRADED: ${lowestTierNFT.name} from ${lowestTierNFT.tier} to ${upgradedNFT.tier}`, 'background: #8b0000; color: #ffa07a; padding: 2px 5px; border-radius: 3px;');
        }
        
      } else if (outcome === 'defeat') {
        // Only apply burn penalty if there are invested NFTs
        const investedNFTs = playerWallet.equippedNFTs.filter(nft => nft.isInvested);
        
        if (investedNFTs.length > 0) {
          const burnedNFTId = burnNFT(investedNFTs);
          
          if (burnedNFTId) {
            // Remove the burned NFT from the wallet
            const burnedNFT = playerWallet.equippedNFTs.find(nft => nft.id === burnedNFTId);
            playerWallet.equippedNFTs = playerWallet.equippedNFTs.filter(nft => nft.id !== burnedNFTId);
            
            console.log(`%c🔥 NFT BURNED: ${burnedNFT?.name} (${burnedNFT?.tier})`, 'background: #8b0000; color: #ffa07a; padding: 2px 5px; border-radius: 3px;');
          }
        } else {
          console.log('%c⚠️ No invested NFTs to burn', 'color: #ffa500; font-weight: bold;');
        }
      }
      
      // Log the current state of the wallet
      console.log('%c💼 WALLET STATE:', 'font-weight: bold; color: #9370db;');
      console.log('Equipped NFTs:', playerWallet.equippedNFTs);
      console.log('Inventory NFTs:', playerWallet.inventoryNFTs);
      console.log('Progression SBTs:', playerWallet.progressionSBTs);
      
    } catch (error) {
      console.error('%c❌ BLOCKCHAIN SIMULATION ERROR:', 'color: red; font-weight: bold;', error);
    }
  }, 1500); // Simulate blockchain transaction time
};

/**
 * Apply difficulty modifiers based on invested NFTs
 */
export const applyDifficultyModifiers = (
  selectedModifiers: DifficultyModifier[], 
  investedNFTs: GameNFT[]
): { difficultyMultiplier: number; rewardMultiplier: number } => {
  console.log('%c⚙️ APPLYING DIFFICULTY MODIFIERS', 'color: #ffd700;');
  
  // Base modifiers
  let difficultyMultiplier = selectedModifiers.reduce((total, mod) => total + mod.riskMultiplier, 1);
  let rewardMultiplier = selectedModifiers.reduce((total, mod) => total + mod.rewardMultiplier, 1);
  
  // Apply bonuses from invested NFTs
  if (investedNFTs.length > 0) {
    // Each invested NFT increases both difficulty and rewards
    const nftBonus = investedNFTs.length * 0.2;
    
    // Additional bonuses based on NFT tiers
    const tierBonuses = investedNFTs.reduce((total, nft) => {
      const tierValues = {
        'T0': 0,
        'T1': 0.05,
        'T2': 0.1,
        'T3': 0.2,
        'T4': 0.3,
        'T5': 0.5
      };
      return total + tierValues[nft.tier];
    }, 0);
    
    difficultyMultiplier += nftBonus + tierBonuses;
    rewardMultiplier += nftBonus + (tierBonuses * 1.5); // Rewards scale faster than difficulty
  }
  
  console.log(`%c⚙️ MODIFIERS CALCULATED: Difficulty x${difficultyMultiplier.toFixed(2)}, Rewards x${rewardMultiplier.toFixed(2)}`, 'color: #ffd700;');
  
  return { difficultyMultiplier, rewardMultiplier };
};

/**
 * Generate reward based on victory and modifiers
 */
export const generateVictoryRewards = (
  playerLevel: number,
  rewardMultiplier: number
): { nft?: GameNFT; sbt?: ProgressionSBT } => {
  console.log('%c🎁 GENERATING REWARDS', 'color: #7fff7f;');
  
  // NFT rarity chances based on level and multiplier
  const rarityChances = {
    common: Math.max(0, 70 - (playerLevel * 2) - (rewardMultiplier * 10)),
    uncommon: Math.min(60, 20 + (playerLevel * 1) + (rewardMultiplier * 5)),
    rare: Math.min(40, 7 + (playerLevel * 0.8) + (rewardMultiplier * 4)),
    epic: Math.min(25, 2 + (playerLevel * 0.5) + (rewardMultiplier * 3)),
    legendary: Math.min(10, 1 + (playerLevel * 0.2) + (rewardMultiplier * 2))
  };
  
  // Determine rarity based on chances
  const roll = Math.random() * 100;
  let selectedRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  if (roll < rarityChances.legendary) {
    selectedRarity = 'legendary';
  } else if (roll < rarityChances.legendary + rarityChances.epic) {
    selectedRarity = 'epic';
  } else if (roll < rarityChances.legendary + rarityChances.epic + rarityChances.rare) {
    selectedRarity = 'rare';
  } else if (roll < rarityChances.legendary + rarityChances.epic + rarityChances.rare + rarityChances.uncommon) {
    selectedRarity = 'uncommon';
  } else {
    selectedRarity = 'common';
  }
  
  // Determine NFT type
  const types = ['weapon', 'armor', 'accessory'];
  const selectedType = types[Math.floor(Math.random() * types.length)] as 'weapon' | 'armor' | 'accessory';
  
  // Determine NFT tier based on player level
  let nftTier: NFTTier = 'T1';
  if (playerLevel >= 30) nftTier = 'T5';
  else if (playerLevel >= 20) nftTier = 'T4';
  else if (playerLevel >= 15) nftTier = 'T3';
  else if (playerLevel >= 10) nftTier = 'T2';
  
  // Generate NFT name based on type and rarity
  const typeNames = {
    weapon: ['Sword', 'Axe', 'Dagger', 'Staff', 'Bow'],
    armor: ['Chestplate', 'Helmet', 'Gauntlets', 'Boots', 'Shield'],
    accessory: ['Ring', 'Amulet', 'Earring', 'Bracelet', 'Belt']
  };
  
  const rarityPrefixes = {
    common: ['Basic', 'Simple', 'Plain', 'Standard', 'Ordinary'],
    uncommon: ['Quality', 'Improved', 'Refined', 'Enhanced', 'Superior'],
    rare: ['Exceptional', 'Remarkable', 'Distinguished', 'Superb', 'Prime'],
    epic: ['Mythical', 'Legendary', 'Ancient', 'Heroic', 'Divine'],
    legendary: ['Godly', 'Celestial', 'Transcendent', 'Ultimate', 'Supreme']
  };
  
  const typeName = typeNames[selectedType][Math.floor(Math.random() * typeNames[selectedType].length)];
  const prefix = rarityPrefixes[selectedRarity][Math.floor(Math.random() * rarityPrefixes[selectedRarity].length)];
  const nftName = `${prefix} ${typeName}`;
  
  // Generate stats based on type, rarity, and tier
  const baseStatValue = 5 + (playerLevel * 0.5) + (rewardMultiplier * 2);
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5
  }[selectedRarity];
  
  const tierMultiplier = {
    'T1': 1,
    'T2': 1.5,
    'T3': 2,
    'T4': 3,
    'T5': 5
  }[nftTier];
  
  const stats: Record<string, number> = {};
  
  if (selectedType === 'weapon') {
    stats.damage = Math.floor(baseStatValue * rarityMultiplier * tierMultiplier);
    stats.speed = Math.floor((baseStatValue * 0.5) * rarityMultiplier * tierMultiplier);
    if (selectedRarity === 'epic' || selectedRarity === 'legendary') {
      stats.criticalHit = Math.floor((baseStatValue * 0.3) * rarityMultiplier * tierMultiplier);
    }
  } else if (selectedType === 'armor') {
    stats.defense = Math.floor(baseStatValue * rarityMultiplier * tierMultiplier);
    stats.durability = Math.floor((baseStatValue * 2) * rarityMultiplier * tierMultiplier);
    if (selectedRarity === 'epic' || selectedRarity === 'legendary') {
      stats.resistance = Math.floor((baseStatValue * 0.3) * rarityMultiplier * tierMultiplier);
    }
  } else if (selectedType === 'accessory') {
    stats.luck = Math.floor((baseStatValue * 0.8) * rarityMultiplier * tierMultiplier);
    stats.charisma = Math.floor((baseStatValue * 0.6) * rarityMultiplier * tierMultiplier);
    if (selectedRarity === 'epic' || selectedRarity === 'legendary') {
      stats.energy = Math.floor((baseStatValue * 0.4) * rarityMultiplier * tierMultiplier);
    }
  }
  
  // Create the NFT
  const newNFT: GameNFT = {
    id: `${selectedType}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: nftName,
    tier: nftTier,
    type: selectedType,
    rarity: selectedRarity,
    stats,
    isInvested: false
  };
  
  // Create progression SBT
  const progressionSBT: ProgressionSBT = {
    id: `sbt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    level: playerLevel,
    achievements: ['Victory in Battle'],
    dateIssued: new Date().toISOString()
  };
  
  console.log(`%c🎁 REWARDS GENERATED: ${newNFT.name} (${newNFT.tier}, ${newNFT.rarity})`, 'color: #7fff7f;');
  
  return {
    nft: newNFT,
    sbt: progressionSBT
  };
};

/**
 * Upgrade an NFT to the next tier
 */
export const upgradeNFT = (nft: GameNFT): GameNFT => {
  console.log(`%c⬆️ UPGRADING NFT: ${nft.name} (${nft.tier})`, 'color: #ffa07a;');
  
  // Map of tier progression
  const tierProgression: Record<NFTTier, NFTTier> = {
    'T0': 'T1',
    'T1': 'T2',
    'T2': 'T3',
    'T3': 'T4',
    'T4': 'T5',
    'T5': 'T5' // Max tier
  };
  
  // Calculate stat improvements
  const statMultiplier = {
    'T0': 1.5,  // T0 -> T1 is a significant upgrade
    'T1': 1.3,  // T1 -> T2
    'T2': 1.3,  // T2 -> T3
    'T3': 1.4,  // T3 -> T4
    'T4': 1.5,  // T4 -> T5
    'T5': 1.0   // No upgrade at max tier
  }[nft.tier];
  
  // Return upgraded NFT
  const upgradedNFT: GameNFT = {
    ...nft,
    tier: tierProgression[nft.tier],
    stats: Object.entries(nft.stats).reduce((newStats, [key, value]) => {
      newStats[key] = Math.floor(value * statMultiplier);
      return newStats;
    }, {} as Record<string, number>)
  };
  
  console.log(`%c⬆️ UPGRADE COMPLETE: ${upgradedNFT.name} (${upgradedNFT.tier})`, 'color: #ffa07a;', upgradedNFT.stats);
  
  return upgradedNFT;
};

/**
 * Handle burning an NFT on defeat
 */
export const burnNFT = (investedNFTs: GameNFT[]): string | null => {
  console.log('%c🔥 INITIATING NFT BURN PROCESS', 'color: #ff6347;');
  
  if (investedNFTs.length === 0) {
    console.log('%c🔥 NO INVESTED NFTs TO BURN', 'color: #ff6347;');
    return null;
  }
  
  // Select a random NFT to burn
  const randomIndex = Math.floor(Math.random() * investedNFTs.length);
  const nftToBurn = investedNFTs[randomIndex];
  
  console.log(`%c🔥 BURNING NFT: ${nftToBurn.name} (${nftToBurn.tier})`, 'color: #ff6347;');
  
  return nftToBurn.id;
};

/**
 * Get the current wallet state (for testing purposes)
 */
export const getWalletState = () => {
  return { ...playerWallet };
};

/**
 * Invest an NFT to modify game difficulty
 */
export const investNFT = (nftId: string, invest: boolean): boolean => {
  const nftIndex = playerWallet.equippedNFTs.findIndex(nft => nft.id === nftId);
  
  if (nftIndex === -1) {
    console.log(`%c❌ NFT NOT FOUND: ${nftId}`, 'color: red;');
    return false;
  }
  
  playerWallet.equippedNFTs[nftIndex].isInvested = invest;
  console.log(`%c${invest ? '🔒 NFT INVESTED' : '🔓 NFT UNINVESTED'}: ${playerWallet.equippedNFTs[nftIndex].name}`, 'color: #9370db;');
  
  return true;
};

/**
 * Reset wallet for testing (dev function)
 */
export const resetWallet = () => {
  playerWallet = {
    equippedNFTs: [],
    inventoryNFTs: [],
    progressionSBTs: []
  };
  playerWallet.equippedNFTs = assignStartingGear();
  console.log('%c💼 WALLET RESET TO INITIAL STATE', 'font-weight: bold; color: #9370db;');
};
