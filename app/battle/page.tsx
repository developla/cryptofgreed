"use client";

import dynamic from 'next/dynamic';

// Dynamically import BattleScreen with no SSR to avoid hydration issues
const BattleScreen = dynamic(
  () => import('@/components/battle/battle-screen').then(mod => ({ default: mod.BattleScreen })),
  { ssr: false }
);

export default function BattlePage() {
  return <BattleScreen />;
}