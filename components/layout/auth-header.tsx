'use client';

import { Button } from '../ui/button';
import { LogIn, LogOut, Wallet } from 'lucide-react';
import { useGameStore } from '@/lib/store/game';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { EmailAuth } from '../auth/email-auth';
import { WalletConnect } from '../wallet-connect';

export function AuthHeader() {
  const { isConnected, emailAuth, logoutEmail, disconnectWallet } = useGameStore();
  const [showAuthSheet, setShowAuthSheet] = useState(false);

  const handleLogout = () => {
    logoutEmail();
    disconnectWallet();
    setShowAuthSheet(false);
  };

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          {emailAuth.email && (
            <span className="text-sm text-muted-foreground">
              {emailAuth.email}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </>
      ) : (
        <Sheet open={showAuthSheet} onOpenChange={setShowAuthSheet}>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Login or Register</SheetTitle>
              <SheetDescription>
                Choose your preferred login method
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <EmailAuth onSuccess={() => setShowAuthSheet(false)} />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <WalletConnect
                minimal
                onSuccess={() => setShowAuthSheet(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}