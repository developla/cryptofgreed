"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

// Loading component
function LoadingBattle() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-4 flex items-center justify-center">
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-primary/20 rounded w-3/4"></div>
          <div className="h-8 bg-primary/10 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-primary/20 rounded w-1/2"></div>
            <div className="h-4 bg-primary/20 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Error component
function BattleError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background p-4 flex items-center justify-center">
      <Card className="p-8 max-w-md">
        <h2 className="text-xl font-bold mb-4">Unable to Load Battle</h2>
        <p className="text-muted-foreground mb-4">
          There was an error loading the battle. Please try again or return to
          the map.
        </p>
        <a
          href="/map"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Return to Map
        </a>
      </Card>
    </div>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Battle error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Dynamically import BattleScreen with no SSR
const BattleScreen = dynamic(
  () =>
    import("@/components/battle/battle-screen").then((mod) => ({
      default: mod.BattleScreen,
    })),
  {
    ssr: false,
    loading: LoadingBattle,
  }
);

export default function BattlePage() {
  return (
    <ErrorBoundary fallback={<BattleError />}>
      <Suspense fallback={<LoadingBattle />}>
        <BattleScreen />
      </Suspense>
    </ErrorBoundary>
  );
}
