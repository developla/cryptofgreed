'use client';

import { useRouter } from 'next/navigation';
import { PathSelection } from '@/components/map/path-selection';
import { useGameStore } from '@/lib/store/game';

export default function PathPage() {
  const { currentCharacter } = useGameStore();
  const router = useRouter();

  if (!currentCharacter) {
    router.push('/');
    return null;
  }

  const handlePathSelect = (path: any) => {
    // Path selection is handled within the PathSelection component
    // This is just to satisfy the prop requirement
  };

  return (
    <PathSelection
      characterLevel={currentCharacter.level}
      onPathSelect={handlePathSelect}
    />
  );
}
