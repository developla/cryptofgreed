'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show navigation on home page or map
  if (pathname === '/' || pathname === '/map') return null;

  // Only show back button on settings page
  if (pathname !== '/settings') return null;

  const handleBack = () => {
    router.push('/map');
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] flex items-center gap-2 bg-white/10 px-4 py-2 backdrop-blur-md">
      <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Game
      </Button>
    </div>
  );
}
