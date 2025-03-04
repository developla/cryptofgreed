import React from 'react';
import { RefreshCw, Map } from 'lucide-react';

interface MapLoadingOverlayProps {
  isLoading: boolean;
}

const MapLoadingOverlay: React.FC<MapLoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm duration-200 animate-in fade-in">
      <div className="max-w-xs rounded-xl bg-white p-6 text-center shadow-lg">
        <div className="relative mb-4">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-amber-500" />
          <Map className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-amber-700" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-gray-800">
          Creating Your Adventure
        </h3>
        <p className="text-gray-600">
          Generating a new map with exciting paths to explore...
        </p>
      </div>
    </div>
  );
};

export default MapLoadingOverlay;
