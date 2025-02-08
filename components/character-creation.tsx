'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { CharacterClass } from '@prisma/client';
import { useGameStore } from '@/lib/store/game';
import { Shield, Wand2, Sword, Heart, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Progress } from './ui/progress';

const CLASS_INFO = {
  [CharacterClass.WARRIOR]: {
    icon: Shield,
    description: 'A stalwart defender with high HP and defensive abilities.',
    stats: { health: 80, energy: 3, maxHealth: 80, maxEnergy: 3 },
  },
  [CharacterClass.MAGE]: {
    icon: Wand2,
    description: 'A powerful spellcaster with devastating magical attacks.',
    stats: { health: 60, energy: 4, maxHealth: 60, maxEnergy: 4 },
  },
  [CharacterClass.ROGUE]: {
    icon: Sword,
    description: 'A nimble fighter who excels at quick, precise strikes.',
    stats: { health: 70, energy: 3, maxHealth: 70, maxEnergy: 3 },
  },
};

interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  experience: number;
}

export function CharacterCreation() {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>(
    CharacterClass.WARRIOR
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const { setCharacter, isConnected } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const initializeCharacters = async () => {
      if (!isConnected) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/character/get', {
          credentials: 'include',
        });

        if (!mounted) return;

        if (response.ok) {
          const { characters } = await response.json();
          setCharacters(characters);

          if (characters.length === 1) {
            setCharacter(characters[0]);
            router.push('/map');
          }
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch characters');
        }
      } catch (error) {
        console.error('Failed to fetch characters:', error);
        toast.error('Failed to load characters');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeCharacters();

    return () => {
      mounted = false;
    };
  }, [isConnected, setCharacter, router]);

  const handleCreate = async () => {
    if (!name) {
      toast.error('Please enter a character name');
      return;
    }

    setIsCreating(true);
    const stats = CLASS_INFO[selectedClass].stats;
    const character = {
      name,
      class: selectedClass,
      level: 1,
      experience: 0,
      ...stats,
      gold: 100,
    };

    try {
      const response = await fetch('/api/character/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(character),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create character');
      }

      const { character: createdCharacter } = await response.json();
      setCharacter(createdCharacter);
      toast.success('Character created successfully!');
      router.push('/map');
    } catch (error) {
      console.error('Character creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create character');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectCharacter = (character: Character) => {
    setCharacter(character);
    router.push('/map');
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl p-6">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Welcome to Project Gamify</h2>
          <p className="text-muted-foreground">
            Please log in or create an account to start your adventure
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8 flex justify-center">
        <Card className="w-full max-w-2xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="mx-auto h-8 w-1/2 rounded bg-primary/20"></div>
            <div className="mx-auto h-4 w-3/4 rounded bg-primary/10"></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded bg-primary/5"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (characters.length > 0) {
    return (
      <div className="mt-8 flex justify-center">
        <Card className="w-full max-w-2xl p-6">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Select Character
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {characters.map((character) => (
              <Card
                key={character.id}
                className="cursor-pointer p-4 transition-colors hover:bg-primary/5"
                onClick={() => handleSelectCharacter(character)}
              >
                <div className="flex items-center gap-4">
                  {character.class === CharacterClass.WARRIOR && (
                    <Shield className="h-8 w-8" />
                  )}
                  {character.class === CharacterClass.MAGE && (
                    <Wand2 className="h-8 w-8" />
                  )}
                  {character.class === CharacterClass.ROGUE && (
                    <Sword className="h-8 w-8" />
                  )}
                  <div>
                    <h3 className="font-bold">{character.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Level {character.level} {character.class}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <Progress
                      value={(character.health / character.maxHealth) * 100}
                      className="flex-1"
                    />
                    <span className="text-sm">
                      {character.health}/{character.maxHealth}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      {character.energy}/{character.maxEnergy} Energy
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setCharacters([])}>
              Create New Character
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl space-y-8 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create Your Character</h1>
        <p className="text-muted-foreground">
          Choose your path in the Crypto Spire
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Character Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your character's name"
            disabled={isCreating}
          />
        </div>

        <div className="space-y-2">
          <Label>Choose Your Class</Label>
          <RadioGroup
            value={selectedClass}
            onValueChange={(value) => setSelectedClass(value as CharacterClass)}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
            disabled={isCreating}
          >
            {Object.entries(CLASS_INFO).map(([className, info]) => {
              const Icon = info.icon;
              return (
                <Label
                  key={className}
                  className={`flex cursor-pointer flex-col items-center rounded-lg border-2 p-4 transition-all ${
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
                  <Icon className="mb-2 h-12 w-12" />
                  <span className="mb-1 font-bold">{className}</span>
                  <p className="text-center text-sm text-muted-foreground">
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
        disabled={!name || isCreating}
      >
        {isCreating ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Creating Character...
          </div>
        ) : (
          'Create Character'
        )}
      </Button>
    </Card>
  );
}