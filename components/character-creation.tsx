"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { CharacterClass } from '@prisma/client';
import { useGameStore } from '@/lib/store/game';
import { Shield, Wand2, Sword } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const CLASS_INFO = {
  [CharacterClass.WARRIOR]: {
    icon: Shield,
    description: 'A stalwart defender with high HP and defensive abilities.',
    stats: { health: 80, energy: 3, maxHealth: 80, maxEnergy: 3 }
  },
  [CharacterClass.MAGE]: {
    icon: Wand2,
    description: 'A powerful spellcaster with devastating magical attacks.',
    stats: { health: 60, energy: 4, maxHealth: 60, maxEnergy: 4 }
  },
  [CharacterClass.ROGUE]: {
    icon: Sword,
    description: 'A nimble fighter who excels at quick, precise strikes.',
    stats: { health: 70, energy: 3, maxHealth: 70, maxEnergy: 3 }
  }
};

export function CharacterCreation() {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>(CharacterClass.WARRIOR);
  const { setCharacter, isConnected, walletAddress } = useGameStore();
  const router = useRouter();

  const handleCreate = async () => {
    if (!name) return;
    if (!isConnected || !walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    const stats = CLASS_INFO[selectedClass].stats;
    const character = {
      name,
      class: selectedClass,
      level: 1,
      experience: 0,
      ...stats,
      gold: 100
    };

    try {
      const response = await fetch('/api/character/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': walletAddress
        },
        body: JSON.stringify(character),
      });

      if (!response.ok) {
        throw new Error('Failed to create character');
      }

      const { character: createdCharacter } = await response.json();
      setCharacter(createdCharacter);
      toast.success('Character created successfully!');
      // Redirect to the map screen after character creation
      router.push('/map');
    } catch (error) {
      console.error('Character creation error:', error);
      toast.error('Failed to create character. Please try again.');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Wallet to Continue</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to create a character and start your adventure.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create Your Character</h1>
          <p className="text-muted-foreground">Choose your path in the Crypto Spire</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Character Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your character's name"
            />
          </div>

          <div className="space-y-2">
            <Label>Choose Your Class</Label>
            <RadioGroup
              value={selectedClass}
              onValueChange={(value) => setSelectedClass(value as CharacterClass)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {Object.entries(CLASS_INFO).map(([className, info]) => {
                const Icon = info.icon;
                return (
                  <Label
                    key={className}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedClass === className
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem
                      value={className}
                      id={className}
                      className="sr-only"
                    />
                    <Icon className="w-12 h-12 mb-2" />
                    <span className="font-bold mb-1">{className}</span>
                    <p className="text-sm text-muted-foreground text-center">
                      {info.description}
                    </p>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCreate}
          disabled={!name}
        >
          Create Character
        </Button>
      </Card>
    </div>
  );
}