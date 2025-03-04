import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { createStarterDeck } from '@/lib/cardData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, User } from 'lucide-react';

const CharacterCreation: React.FC = () => {
  const { dispatch } = useGame();
  const [name, setName] = useState('');

  const handleCreateCharacter = () => {
    if (!name.trim()) return;

    const id = Math.random().toString(36).substring(2, 11);

    // First create the character
    dispatch({
      type: 'CREATE_CHARACTER',
      payload: {
        id,
        name: name.trim(),
        maxHealth: 50,
        currentHealth: 50,
        maxEnergy: 3,
        currentEnergy: 3,
        deck: createStarterDeck(),
        gold: 100,
        level: 1,
        experience: 0,
        class: 'warrior', // Adding default class property
      },
    });

    // Then select the created character (this should happen automatically in the reducer)
    dispatch({
      type: 'SELECT_CHARACTER',
      payload: id,
    });

    // Finally navigate to the map
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE', payload: 'map' });
    }, 100);

    setName('');
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="glass-card relative overflow-hidden rounded-xl border border-amber-900/20 p-8">
        {/* Dark fantasy background effects */}
        <div className="absolute inset-0 bg-red-900/5 opacity-30"></div>
        <div className="absolute inset-0 animate-fog-move bg-fog-texture opacity-20"></div>
        <div className="absolute inset-0 animate-flicker bg-card-pattern opacity-10"></div>

        <div className="relative z-10">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-900/20 to-amber-700/30">
              <User className="h-10 w-10 text-amber-800/70" />
            </div>
            <h2 className="font-['Cinzel'] text-2xl font-bold text-amber-900">
              Create Your Character
            </h2>
            <p className="mt-2 text-center font-['MedievalSharp'] text-amber-800/80">
              Your adventure begins with a name...
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium text-amber-900">
                Character Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter character name"
                className="w-full border-amber-700/30 bg-white/90 focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleCreateCharacter}
                disabled={!name.trim()}
                variant="crypt"
                className="w-full border border-amber-700/30 py-6 active:scale-[0.98]"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Begin Your Journey
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;
