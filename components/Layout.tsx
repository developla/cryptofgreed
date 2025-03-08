'use client';
import React from 'react';
import { GameProvider } from '@/context/GameContext';
import { WalletProvider } from '@/context/WalletContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <WalletProvider><GameProvider>{children}</GameProvider></WalletProvider>;
}
