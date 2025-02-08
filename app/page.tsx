import { WalletConnect } from "@/components/wallet-connect";
import { GameTitle } from "@/components/game-title";
import { CharacterCreation } from "@/components/character-creation";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background/90 to-background">
      <div className="container mx-auto px-4 py-8">
        <GameTitle />
        <WalletConnect />
        <CharacterCreation />
      </div>
    </main>
  );
}
