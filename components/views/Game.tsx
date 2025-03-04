'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import Navbar from '@/components/Navbar';
import Home from '@/components/views/Home';
import Characters from '@/components/views/Characters';
import MapView from '@/components/views/MapView';
import Battle from '@/components/views/Battle';
import DeckView from '@/components/views/DeckView';
import InventorySystem from '@/components/views/InventorySystem';
import GameOver from '@/components/GameOver';
import Shop from '@/components/Shop';
import Rest from '@/components/Rest';
import CharacterHUD from '@/components/CharacterHUD';
import FloatingAccountButton from '@/components/FloatingAccountButton';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import { loadUserSession } from '@/lib/storage';

const Game: React.FC = () => {
  const { state, dispatch } = useGame();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  console.log('Current game phase:', state.gamePhase);
  console.log('User state:', state.user ? state.user.username : 'None');
  console.log(
    'Active character:',
    state.activeCharacter ? state.activeCharacter.name : 'None'
  );
  console.log('Battle mode:', state.inBattleMode ? 'ON' : 'OFF');

  // Force return to battle if in battle mode but not on allowed pages
  useEffect(() => {
    if (state.inBattleMode && state.inBattle) {
      const allowedPhasesInBattle = ['battle', 'inventory-system'];
      if (!allowedPhasesInBattle.includes(state.gamePhase)) {
        console.log('Forcing return to battle from:', state.gamePhase);
        dispatch({ type: 'NAVIGATE', payload: 'battle' });
      }
    }
  }, [state.gamePhase, state.inBattleMode, state.inBattle, dispatch]);

  // Check for user session on startup
  useEffect(() => {
    if (!state.user?.isLoggedIn) {
      const userSession = loadUserSession();
      if (userSession) {
        console.log('User session found, auto-login');
        dispatch({
          type: 'LOGIN',
          payload: {
            username: userSession.username,
            email: userSession.email,
            password: 'password-placeholder',
            authenticated: true,
            user: {
              id: userSession.id,
              username: userSession.username,
              email: userSession.email,
            },
          },
        });
      }
    }
  }, [dispatch, state.user]);

  // Handle default game phase and login modal
  useEffect(() => {
    if (!state.gamePhase) {
      dispatch({ type: 'NAVIGATE', payload: 'menu' });
    } else if (!state.user?.isLoggedIn && state.gamePhase !== 'menu') {
      if (!showLoginModal && !showRegisterModal) {
        setShowLoginModal(true);
      }
    }
  }, [state.gamePhase, state.user, dispatch, showLoginModal, showRegisterModal]);

  // Close modals if user is logged in
  useEffect(() => {
    if (state.user?.isLoggedIn) {
      setShowLoginModal(false);
      setShowRegisterModal(false);
    }
  }, [state.user?.isLoggedIn]);

  // Transition timeout: force navigation if state is stuck
  useEffect(() => {
    const isTransitioning = ![
      'menu',
      'character-selection',
      'map',
      'battle',
      'shop',
      'rest',
      'deck',
      'inventory-system',
      'reward',
      'game-over'
    ].includes(state.gamePhase);

    if (isTransitioning) {
      transitionTimeoutRef.current = window.setTimeout(() => {
        console.log('Transition timeout triggered - forcing navigation to menu');
        if (state.inBattleMode && state.inBattle) {
          dispatch({ type: 'NAVIGATE', payload: 'battle' });
        } else {
          dispatch({ type: 'NAVIGATE', payload: 'menu' });
        }
      }, 3000);
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [state.gamePhase, state.inBattleMode, state.inBattle, dispatch]);

  // Handlers for modal switching
  const handleRegisterClick = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleLoginClick = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  // Render component based on current game phase
  const renderGamePhase = () => {
    switch (state.gamePhase) {
      case 'menu':
        return <Home />;
      case 'character-selection':
        return <Characters />;
      case 'map':
        return <MapView />;
      case 'battle':
        return <Battle />;
      case 'shop':
        return <Shop />;
      case 'rest':
        return <Rest />;
      case 'deck':
        return <DeckView />;
      case 'inventory-system':
        return <InventorySystem />;
      case 'reward':
        return <Battle />;
      case 'game-over':
        return <GameOver />;
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="mb-4 text-xl font-bold">Transitioning...</h2>
            <p>Loading the next part of your adventure.</p>
          </div>
        );
    }
  };

  return (
    <div className="app min-h-screen bg-slate-50">
      <Navbar
        onLoginClick={() => setShowLoginModal(true)}
        onRegisterClick={() => setShowRegisterModal(true)}
      />
      <main className="relative pb-16 pt-4">{renderGamePhase()}</main>

      {state.activeCharacter && state.user?.isLoggedIn && <CharacterHUD />}
      {state.user?.isLoggedIn && <FloatingAccountButton />}

      <LoginModal
        isOpen={showLoginModal && !state.user?.isLoggedIn}
        onClose={() => setShowLoginModal(false)}
        onRegisterClick={handleRegisterClick}
      />

      <RegisterModal
        isOpen={showRegisterModal && !state.user?.isLoggedIn}
        onClose={() => setShowRegisterModal(false)}
        onLoginClick={handleLoginClick}
      />
    </div>
  );
};

export default Game;
