import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import {
  X,
  User,
  Settings,
  ShieldQuestion,
  Save,
  Edit,
  Mail,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogContent, AlertDialogTitle } from '@radix-ui/react-alert-dialog';
import { AlertDialogHeader } from './ui/alert-dialog';
import { AlertDialogFooter } from './ui/alert-dialog';
import { clearGameState, clearUserSession } from '@/lib/storage';

interface UserAccountPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserUpdateData {
  username: string;
  email: string;
  preferences: {
    darkMode: boolean;
    soundEnabled: boolean;
  };
  achievements: string[];
}

const UserAccountPopup: React.FC<UserAccountPopupProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, dispatch } = useGame();
  const { user, inBattleMode } = state;
  const { toast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedEmail, setEditedEmail] = useState('');

  if (!isOpen || !user) return null;

  // handle logout
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

  // Open the edit dialog and populate with current values
  const handleEditClick = () => {
    setEditedUsername(user.username);
    setEditedEmail(user.email);
    setIsEditDialogOpen(true);
  };

  // Placeholder function for updating user account info
  const updateUserAccount = async (
    userData: UserUpdateData
  ): Promise<{ success: boolean; message: string }> => {
    console.log(
      'Account update placeholder function called with data:',
      userData
    );

    try {
      // PLACEHOLDER: Simulating API call and validation

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Basic validation
      if (!userData.username.trim()) {
        return { success: false, message: 'Username cannot be empty' };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return { success: false, message: 'Invalid email format' };
      }

      // In a real implementation, this would send data to a backend service
      // This is designed to be easily connected to a backend later

      // Return success response
      return {
        success: true,
        message: 'Account updated successfully',
      };
    } catch (error) {
      console.error('Error updating user account:', error);
      return {
        success: false,
        message: 'An error occurred while updating your account',
      };
    }
  };

  // Track user progression (achievements, unlocked items, etc.)
  const trackUserProgression = async (
    userId: string,
    progressData: any
  ): Promise<void> => {
    console.log('Tracking progression for user:', userId, progressData);

    // PLACEHOLDER: In a real implementation, this would:
    // 1. Send progression data to a backend service
    // 2. Update achievement status
    // 3. Unlock new content based on progression
  };

  // Function to handle save in the edit dialog
  const handleSaveUserChanges = async () => {
    // Prepare user data for update
    const userData: UserUpdateData = {
      username: editedUsername,
      email: editedEmail,
      preferences: {
        darkMode: false,
        soundEnabled: true,
      },
      achievements: [],
    };

    // Call the placeholder update function
    const result = await updateUserAccount(userData);

    if (result.success) {
      // Update our local state manually
      dispatch({
        type: 'LOGIN',
        payload: {
          username: editedUsername,
          email: editedEmail,
          password: 'password-placeholder',
          authenticated: true,
          user: {
            id: user.id,
            username: editedUsername,
            email: editedEmail,
          },
        },
      });

      // Track this as a progression event
      trackUserProgression(user.id, {
        type: 'account_update',
        timestamp: new Date().toISOString(),
      });

      toast({
        title: 'Success',
        description: 'Account details updated successfully',
        duration: 3000,
      });

      setIsEditDialogOpen(false);
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

 

  const handleSupportClick = () => {
    // Placeholder for support functionality
    toast({
      title: 'Support',
      description: 'Support system is coming soon!',
      duration: 3000,
    });
  };

  const handleSettingsClick = () => {
    // Placeholder for settings functionality
    toast({
      title: 'Settings',
      description: 'Game settings will be available soon!',
      duration: 3000,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="relative w-full max-w-md animate-slide-up border-amber-900/30 bg-slate-50 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-amber-900/20 pb-2">
          <div>
            <CardTitle className="text-amber-900">My Account</CardTitle>
            <CardDescription>Manage your game account</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center space-x-4 rounded-lg border border-amber-900/10 bg-slate-100 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-900/10">
              <User className="h-7 w-7 text-red-800" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">{user.username}</h3>
              <p className="text-sm text-slate-500">
                Account ID: {user.id.substring(0, 8)}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditClick}
              className="border-amber-700/30 hover:bg-amber-100"
            >
              <Edit className="mr-1 h-4 w-4 text-amber-700" />
              Edit
            </Button>
          </div>

          <div className="space-y-3 rounded-md border border-amber-900/10 bg-slate-100 p-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">
                Maximum Character Slots
              </span>
              <span className="font-medium text-amber-900">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Account Balance</span>
              <span className="font-medium text-amber-900">
                {user.gold} Gold
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Account Status</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
          </div>

          <Separator className="bg-amber-900/20" />

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="flex items-center justify-start gap-2 border-amber-700/30 hover:bg-amber-100"
              onClick={handleSettingsClick}
            >
              <Settings className="h-4 w-4 text-amber-700" />
              <span>Settings</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-start gap-2 border-amber-700/30 hover:bg-amber-100"
              onClick={handleSupportClick}
            >
              <ShieldQuestion className="h-4 w-4 text-amber-700" />
              <span>Support</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2 items-center justify-center first:">
        
          <Button
                  variant="outline"
                  className={`flex items-center gap-2  border-amber-700/30 text-red-700 hover:bg-red-50 ${inBattleMode ? 'cursor-not-allowed opacity-50' : ''}`}
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
          </div>
        </CardContent>


      </Card>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md border border-amber-900/20 bg-slate-50">
          <DialogHeader>
            <DialogTitle className="text-amber-900">
              Edit Account Details
            </DialogTitle>
            <DialogDescription>
              Update your account information below. Changes will be saved to
              your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-amber-900">
                Username
              </Label>
              <div className="flex">
                <User className="mr-2 h-4 w-4 self-center text-amber-700" />
                <Input
                  id="username"
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  className="border-amber-700/30 focus:ring-amber-700/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-amber-900">
                Email
              </Label>
              <div className="flex">
                <Mail className="mr-2 h-4 w-4 self-center text-amber-700" />
                <Input
                  id="email"
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="border-amber-700/30 focus:ring-amber-700/30"
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs italic text-slate-500">
                Additional account settings will be available in future updates
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-amber-700/30 hover:bg-amber-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveUserChanges}
              className="bg-amber-700 hover:bg-amber-800"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Logout Confirmation Dialog */}
       <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 animate-in fade-in bg-black/60 backdrop-blur-sm duration-200" />
        )}
        <AlertDialogContent className="fixed left-[50%] top-[50%] z-[51] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl border border-slate-200 bg-white p-6 shadow-lg duration-200">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-center text-xl font-semibold text-red-800">
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base text-slate-600">
              Logging out will reset all game progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel 
              className="flex-1 rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserAccountPopup;
