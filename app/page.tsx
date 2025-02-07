import { WalletConnect } from '@/components/wallet-connect';
import { GameTitle } from '@/components/game-title';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background/90 to-background flex flex-col items-center justify-center p-4">
      <GameTitle />
      <WalletConnect />
    </main>
  );
}