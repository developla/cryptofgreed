'use client';

import { Button } from '../ui/button';
import { LogIn, LogOut, Settings, ChevronDown } from 'lucide-react';
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
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AuthHeader() {
  const { isConnected, emailAuth, logoutEmail } = useGameStore();
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  function getInitials(email: string | null): import('react').ReactNode {
    if (!email) return 'NN';
    const [name] = email.split('@');
    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('');
    return initials.toUpperCase();
  }

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-12 w-12 rounded-full p-0 sm:h-16 sm:w-16"
            >
              <Avatar className="h-full w-full">
                <AvatarImage
                  src="/placeholder.svg?height=36&width=36"
                  alt={emailAuth.email ?? 'default-alt-text'}
                />
                <AvatarFallback>{getInitials(emailAuth.email)}</AvatarFallback>
              </Avatar>
              {/* Arrow icon positioned inside the avatar */}
              <div className="absolute bottom-0 right-0 rounded-full bg-black/50 p-1">
                <ChevronDown className="h-4 w-4 text-white" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="bottom">
            <DropdownMenuItem className="p-3">
              <div className="flex flex-col">
                <span className="font-medium">
                  {emailAuth.email?.split('@')[0]}
                </span>
                <span className="text-sm text-muted-foreground">
                  {emailAuth.email}
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isConnected && pathname !== '/settings' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/settings')}
                className="gap-2 hover:bg-primary/10"
              >
                <Settings className="h-4 w-4" />
                <span className="">Settings</span>
              </Button>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="p-3"
              onSelect={handleLogout}
              disabled={isLoggingOut}
            >
              <div className="flex items-center gap-2">
                {isLoggingOut ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </>
                )}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
