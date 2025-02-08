'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PathSelection } from '@/components/map/path-selection';
import { useGameStore } from '@/lib/store/game';

export default function PathPage() {
  const { currentCharacter } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    if (!currentCharacter) {
      router.push('/');
    }
  }, [currentCharacter, router]);

  if (!currentCharacter) {
    return null;
  }

  const handlePathSelect = (path: any) => {
    // Path selection is handled within the PathSelection component
  };

  return (
    <PathSelection
      characterLevel={currentCharacter.level}
      onPathSelect={handlePathSelect}
    />
  );
}
