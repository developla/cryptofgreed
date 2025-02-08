import { GameTitle } from '@/components/game-title';
import { CharacterCreation } from '@/components/character-creation';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-background/90 to-background px-4 py-8">
      <div className="container max-w-2xl">
        <GameTitle />
        <CharacterCreation />
      </div>
    </main>
  );
}
