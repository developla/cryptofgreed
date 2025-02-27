'use client';

import { DeckViewer } from '@/components/deck/deck-viewer';

export default function DeckPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Deck Viewer</h1>
      <DeckViewer showPlayedCards />
    </div>
  );
}