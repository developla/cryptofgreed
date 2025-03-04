import React, { useState } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserAccountPopup from './UserAccountPopup';
import { useGame } from '@/context/GameContext';

const FloatingAccountButton: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { state } = useGame();

  // Don't show the button if user is not logged in
  if (!state.user?.isLoggedIn) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsPopupOpen(true)}
          className="h-12 w-12 rounded-full border-2 border-amber-600/50 bg-red-800 shadow-lg hover:bg-red-900"
          aria-label="My Account"
        >
          <User className="h-5 w-5 text-amber-100" />
        </Button>
      </div>

      <UserAccountPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};

export default FloatingAccountButton;
