'use client';

import { Sword } from 'lucide-react';

export function GameTitle() {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 flex items-center justify-center">
        <Sword className="h-12 w-12 animate-pulse text-primary" />
      </div>
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-primary">
        Project Gamify
      </h1>
      <p className="text-muted-foreground">
        A Web3-powered roguelike deck-building adventure
      </p>
    </div>
  );
}
