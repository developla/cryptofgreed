'use client';

import { Button } from '../ui/button';
import { LogIn, LogOut } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function AuthHeader() {
  const { isConnected, emailAuth, logoutEmail } = useGameStore();
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      logoutEmail();
      setShowAuthSheet(false);
      router.push('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
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
            disabled={isLoggingOut}
            className="gap-2"
          >
            {isLoggingOut ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            )}
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
                Sign in to your account or create a new one
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <EmailAuth onSuccess={() => setShowAuthSheet(false)} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
