"use client";

import { Sword } from "lucide-react";

export function GameTitle() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <Sword className="w-12 h-12 text-primary animate-pulse" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">
        Project Gamify
      </h1>
      <p className="text-muted-foreground">
        A Web3-powered roguelike deck-building adventure
      </p>
    </div>
  );
}
