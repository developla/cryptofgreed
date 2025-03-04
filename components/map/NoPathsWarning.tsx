import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, AlertTriangle } from 'lucide-react';

interface NoPathsWarningProps {
  show: boolean;
  onRegenerateMap: () => void;
  isRegenerating: boolean;
}

const NoPathsWarning: React.FC<NoPathsWarningProps> = ({
  show,
  onRegenerateMap,
  isRegenerating,
}) => {
  if (!show) return null;

  return (
    <div className="absolute left-1/2 top-1/2 z-50 w-4/5 max-w-md -translate-x-1/2 -translate-y-1/2 transform">
      <Alert className="animate-fade-in border-amber-200 bg-white/95 backdrop-blur-sm">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-700">Begin Your Journey</AlertTitle>
        <AlertDescription className="mb-3 text-amber-600">
          Click on any highlighted node on the map to start your adventure, or
          generate a new map if you prefer.
        </AlertDescription>
        <div className="flex justify-center">
          <Button
            onClick={onRegenerateMap}
            variant="default"
            size="sm"
            disabled={isRegenerating}
            className="mt-1 bg-amber-500 text-white hover:bg-amber-600"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`}
            />
            {isRegenerating ? 'Generating New Map...' : 'Generate New Map'}
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default NoPathsWarning;
