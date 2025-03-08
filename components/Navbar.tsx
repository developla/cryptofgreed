import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useWallet } from '@/context/WalletContext';
import { LogIn, LogOut, Wallet, UserPlus, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { clearGameState, clearUserSession } from '@/lib/storage';

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onRegisterClick }) => {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { inBattleMode } = state;
  
  // Replace the walletConnected state with the wallet context
  const { isConnected, address, connect, disconnect } = useWallet();

  const handleLogout = () => {
    // Block logout during battle
    if (inBattleMode) {
      toast({
        title: 'Action Blocked',
        description: 'Cannot log out during battle!',
        variant: 'destructive',
      });
      return;
    }

    // Clear all local storage completely
    clearGameState();
    clearUserSession();
    localStorage.clear(); // Additional cleanup to ensure everything is removed

    // Reset the game state completely
    dispatch({ type: 'LOGOUT' });

    toast({
      title: 'Logged out',
      description:
        'You have been logged out successfully. All game data has been reset.',
    });
  };

  const handleGoHome = () => {
    // Block navigation during battle mode
    if (inBattleMode) {
      toast({
        title: 'Action Blocked',
        description: 'Cannot navigate to home during battle!',
        variant: 'destructive',
      });
      return;
    }
    dispatch({ type: 'NAVIGATE', payload: 'menu' });
  };

  const handleConnectWallet = async () => {
    if (inBattleMode) {
      toast({
        title: 'Action Blocked',
        description: 'Cannot connect wallet during battle!',
        variant: 'destructive',
      });
      return;
    }

    try {
      await connect();
      toast({
        title: 'Wallet Connected',
        description: 'Your wallet has been connected successfully.',
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnectWallet = () => {
    if (inBattleMode) {
      toast({
        title: 'Action Blocked',
        description: 'Cannot disconnect wallet during battle!',
        variant: 'destructive',
      });
      return;
    }

    disconnect();
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 py-3 shadow-sm backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - Now Clickable */}
          <div
            className={`flex items-center gap-2 ${inBattleMode ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
            onClick={handleGoHome}
          >
            <Skull className="h-6 w-6 text-red-700" />
            <span className="bg-gradient-to-r from-red-800 to-amber-700 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
              Crypt of Greed
            </span>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {state.user?.isLoggedIn && (
              <>
                <span className="hidden text-sm text-slate-600 md:inline-block">
                  Logged in as{' '}
                  <span className="font-medium">{state.user.username}</span>
                </span>

                {/* Wallet Connection UI */}
                {isConnected ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-amber-600 text-amber-700"
                        disabled={inBattleMode}
                      >
                        <Wallet className="h-4 w-4" />
                        <span className="hidden md:inline-block">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 border-slate-200 bg-slate-50"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer text-red-700"
                        onClick={handleDisconnectWallet}
                      >
                        Disconnect Wallet
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-amber-600 text-amber-700 hover:bg-amber-50"
                    onClick={handleConnectWallet}
                    disabled={inBattleMode}
                  >
                    <Wallet className="h-4 w-4" />
                    <span className="hidden md:inline-block">
                      Connect Wallet
                    </span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className={`flex items-center gap-2 border-red-700 text-red-700 hover:bg-red-50 ${inBattleMode ? 'cursor-not-allowed opacity-50' : ''}`}
                  onClick={() => {
                    if (inBattleMode) {
                      toast({
                        title: 'Action Blocked',
                        description: 'Cannot log out during battle!',
                        variant: 'destructive',
                      });
                      return;
                    }
                    setShowLogoutConfirm(true);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline-block">Logout</span>
                </Button>
              </>
            )}

            {!state.user?.isLoggedIn && (
              <>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-amber-600 text-amber-700 hover:bg-amber-50"
                  onClick={onRegisterClick}
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden md:inline-block">Register</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-red-700 text-red-700 hover:bg-red-50"
                  onClick={onLoginClick}
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden md:inline-block">Login</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="border-slate-200 bg-slate-50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-800">
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-700">
              Logging out will reset all game progress. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-slate-700 hover:bg-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-700 text-white hover:bg-red-800"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Navbar;
