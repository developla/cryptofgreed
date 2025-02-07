import { WalletConnect } from '@/components/wallet-connect';
import { GameTitle } from '@/components/game-title';
import { CharacterCreation } from '@/components/character-creation';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background/90 to-background">
      <GameTitle />
      <WalletConnect />
      <CharacterCreation />
    </main>
  );
}