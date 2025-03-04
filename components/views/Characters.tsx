'use client';
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import CharacterCreation from '@/components/CharacterCreation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  User,
  Shield,
  Award,
  Heart,
  Layers,
  ArrowLeft,
  PlusCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const CharactersPage: React.FC = () => {
  const { state, dispatch } = useGame();
  const { characters, activeCharacter, user } = state;
  const { toast } = useToast();
  const [showCreation, setShowCreation] = useState(false);

  // Automatically navigate to map when a character is selected
  const handleSelectCharacter = (characterId: string) => {
    dispatch({ type: 'SELECT_CHARACTER', payload: characterId });
    dispatch({ type: 'NAVIGATE', payload: 'map' });
  };

  const handleBackToMenu = () => {
    dispatch({ type: 'NAVIGATE', payload: 'menu' });
  };

  const handleToggleCreation = () => {
    // Check if the user has available character slots
    if (characters.length >= (user?.maxCharacterSlots || 1) && !showCreation) {
      toast({
        title: 'Character Limit Reached',
        description:
          'You can only have one character per account in this game.',
        variant: 'destructive',
      });
      return;
    }

    setShowCreation(!showCreation);
  };

  // Check if user has reached character limit
  const hasReachedCharacterLimit =
    characters.length >= (user?.maxCharacterSlots || 1);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header with page title and back button */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-['Cinzel'] text-3xl font-bold text-amber-900">
          Characters
        </h1>
        <Button
          variant="outline"
          onClick={handleBackToMenu}
          className="border-amber-700/30 text-amber-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Button>
      </div>

      {/* Show either character list or character creation based on state */}
      {!showCreation ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-amber-800">
                Character Slot: {characters.length}/
                {user?.maxCharacterSlots || 1}
              </h2>
              <p className="text-sm text-amber-700/80">
                In Crypt of Greed, each account can have one character
              </p>
            </div>
          </div>

          {characters.length > 0 ? (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {characters.map((character) => (
                <Card
                  key={character.id}
                  className={`overflow-hidden transition-all duration-300 ${
                    activeCharacter?.id === character.id
                      ? 'ring-2 ring-amber-700'
                      : ''
                  } border-amber-900/20 bg-slate-50`}
                >
                  <CardHeader className="px-6 pb-2 pt-6">
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-['Cinzel'] text-xl text-amber-900">
                        {character.name}
                      </CardTitle>
                      {activeCharacter?.id === character.id && (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-green-700"
                        >
                          <CheckCircle className="mr-1 h-3.5 w-3.5" />
                          Selected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="px-6">
                    <div className="mb-4 flex items-center justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-900/20 to-amber-700/30">
                        <span className="text-3xl font-bold text-amber-800">
                          {character.name.charAt(0)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-y-2">
                      <div className="flex items-center gap-2 text-sm text-amber-800">
                        <Heart className="text-game-health h-4 w-4" />
                        <span>Health: {character.maxHealth}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-amber-800">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span>Level: {character.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-amber-800">
                        <Shield className="text-game-defense h-4 w-4" />
                        <span>
                          Defense:{' '}
                          {character.equippedItems.armor
                            ? character.equippedItems.armor.value
                            : 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-amber-800">
                        <Layers className="h-4 w-4 text-indigo-500" />
                        <span>Cards: {character.deck.length}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 pb-6">
                    <Button
                      onClick={() => handleSelectCharacter(character.id)}
                      variant="crypt"
                      className="w-full border border-amber-700/30 active:scale-[0.98]"
                    >
                      {activeCharacter?.id === character.id
                        ? 'Already Selected'
                        : 'Select Character'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {/* Character slot card (empty) */}
              {!hasReachedCharacterLimit && (
                <div onClick={handleToggleCreation} className="cursor-pointer">
                  <Card className="flex h-full flex-col items-center justify-center overflow-hidden border-2 border-dashed border-amber-700/30 bg-gradient-to-br from-slate-50 to-amber-50 p-8 transition-all active:scale-[0.99]">
                    <div className="mb-4 rounded-full bg-amber-100 p-6">
                      <User className="h-14 w-14 text-amber-700/70" />
                    </div>
                    <CardTitle className="mb-2 font-['Cinzel'] text-amber-900">
                      Begin Your Tale
                    </CardTitle>
                    <CardDescription className="mb-6 text-center font-['MedievalSharp'] text-amber-800/80">
                      Create a new character to venture into the crypt
                    </CardDescription>
                    <Button
                      variant="crypt"
                      className="border border-amber-700/30 active:scale-[0.98]"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Character
                    </Button>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-10 rounded-lg border border-amber-900/10 bg-gradient-to-br from-slate-50 to-amber-50 py-16 text-center">
              <User className="mx-auto mb-4 h-16 w-16 text-amber-700/70" />
              <h2 className="mb-2 font-['Cinzel'] text-xl font-medium text-amber-900">
                Your Adventure Awaits
              </h2>
              <p className="mx-auto mb-6 max-w-md font-['MedievalSharp'] text-amber-800/80">
                Create your character to begin your journey into the Crypt of
                Greed!
              </p>
              <Button
                size="lg"
                onClick={handleToggleCreation}
                variant="crypt"
                className="gap-2 border border-amber-700/30 px-8 py-6 active:scale-[0.98]"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Your Character
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="animate-fade-in mx-auto max-w-2xl">
          <CharacterCreation />
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={handleToggleCreation}
              className="border-amber-700/30 text-amber-900"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharactersPage;
