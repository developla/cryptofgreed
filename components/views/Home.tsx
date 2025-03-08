'use client';
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Play, Swords, BookOpen, Skull, Flame, Shield } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';

const Home: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Close modals if user is already logged in
  useEffect(() => {
    if (state.user?.isLoggedIn) {
      setIsLoginModalOpen(false);
      setIsRegisterModalOpen(false);
    }
  }, [state.user?.isLoggedIn]);

  const handleStartGame = () => {
    if (state.user?.isLoggedIn) {
      // Check if there's an active character before navigating to map
      if (state.activeCharacter) {
        dispatch({ type: 'NAVIGATE', payload: 'map' });
      } else {
        // Navigate to character selection if no character is active
        dispatch({ type: 'NAVIGATE', payload: 'character-selection' });
      }
    } else {
      // Show login modal instead of redirecting
      setIsLoginModalOpen(true);
    }
  };

  // Handle switching between login and register modals
  const handleRegisterClick = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleLoginClick = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      <div className="relative h-[75vh] w-full overflow-hidden">
        {/* Background with animated effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/95 via-red-800/95 to-amber-900/90"></div>

        {/* Animated fog texture */}
        <div className="animate-fog-move bg-fog-texture absolute inset-0 opacity-30"></div>

        {/* Flickering pattern overlay */}
        <div className="animate-flicker bg-card-pattern absolute inset-0 opacity-10"></div>

        {/* Dark vignette effect */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-transparent to-black/50"></div>

        <div className="container relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
          <h1 className="animate-fade-in mb-6 font-['Cinzel'] text-4xl font-bold text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] md:text-7xl">
            Crypt of Greed
          </h1>

          <p className="animate-slide-up mx-auto mb-12 max-w-2xl font-['MedievalSharp'] text-xl leading-relaxed text-amber-100/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] md:text-2xl">
            A dark strategic deck-building adventure where greed determines your
            fate
          </p>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button
              onClick={handleStartGame}
              variant="crypt"
              size="lg"
              className="border-amber-600/30 px-10 py-8 text-lg font-medium shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <Play className="mr-2 h-5 w-5" />
              {state.user?.isLoggedIn
                ? 'Continue Your Journey'
                : 'Enter the Crypt'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-[url('data:image/svg+xml,%3Csvg width%3D%2760%27 height%3D%2760%27 viewBox%3D%270 0 60 60%27 xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath d%3D%27M54.01 49.99c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87l-3.19 3.19c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87l-3.19 3.19c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87L-2-2l10.11 10.11c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87l-3.19 3.19c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87l-3.19 3.19c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87L-20-20l38.11 38.11c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87l-3.19 3.19c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87l-3.19 3.19c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87l-3.19 3.19c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87l-3.19 3.19c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87L-2 30l20.11 20.11c-.73.35-1.53.5-2.3.5s-1.57-.15-2.3-.5c-1.24-.63-2.13-1.7-2.64-2.87l-3.19 3.19 10.11 10.11L60 60l3.19-3.19c-.63-1.24-1.7-2.13-2.87-2.64l-6.31-4.18z%27 fill%3D%27%23400%27 fill-opacity%3D%27.03%27 fill-rule%3D%27evenodd%27%2F%3E%3C%2Fsvg%3E')] bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center font-['Cinzel'] text-3xl font-bold text-red-900">
            Your Dark Adventure Awaits
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card
              className="dark-card animate-slide-up transform border-red-900/10 bg-white p-6 shadow-lg transition-transform"
              style={{ animationDelay: '0.1s' }}
            >
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-red-900/10">
                  <Swords className="h-7 w-7 text-red-900" />
                </div>
                <CardTitle className="gothic-heading text-xl">
                  Mortal Combat
                </CardTitle>
                <CardDescription className="text-base text-slate-700">
                  Master deck-building and tactical card play to overcome the
                  horrors that lurk within the ancient crypt
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="dark-card animate-slide-up transform border-amber-700/10 bg-white p-6 shadow-lg transition-transform"
              style={{ animationDelay: '0.2s' }}
            >
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-amber-700/10">
                  <Flame className="h-7 w-7 text-amber-700" />
                </div>
                <CardTitle className="gothic-heading text-xl">
                  Cursed Items
                </CardTitle>
                <CardDescription className="text-base text-slate-700">
                  Discover powerful relics and weapons, but beware their
                  corrupting influence on your very soul
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="dark-card animate-slide-up transform border-red-800/10 bg-white p-6 shadow-lg transition-transform"
              style={{ animationDelay: '0.3s' }}
            >
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-red-800/10">
                  <Shield className="h-7 w-7 text-red-800" />
                </div>
                <CardTitle className="gothic-heading text-xl">
                  Dark Descent
                </CardTitle>
                <CardDescription className="text-base text-slate-700">
                  Delve deeper into the crypt where greater treasures and
                  dangers await the brave and foolish
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <p className="mx-auto mb-8 max-w-2xl font-['MedievalSharp'] text-lg text-amber-800">
              "The crypt calls to those with ambition in their hearts and gold
              in their eyes. Few return with their souls intact."
            </p>

            <Button
              onClick={handleStartGame}
              variant="crypt"
              className="border-amber-600/30 px-8 py-6 text-base shadow-md"
            >
              <Skull className="mr-2 h-4 w-4" />
              Begin Your Descent
            </Button>
          </div>
        </div>
      </div>

      {/* Modal components - Using isOpen prop instead of conditional rendering */}
      <LoginModal
        isOpen={isLoginModalOpen && !state.user?.isLoggedIn}
        onClose={() => setIsLoginModalOpen(false)}
        onRegisterClick={handleRegisterClick}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen && !state.user?.isLoggedIn}
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={handleLoginClick}
      />
    </div>
  );
};

export default Home;
