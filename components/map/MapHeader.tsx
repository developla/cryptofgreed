import React from 'react';
import { Map as MapIcon } from 'lucide-react';

const MapHeader: React.FC = () => {
  return (
    <>
      {/* Instructions */}
      <div className="absolute left-2 top-2 z-10 flex items-center rounded-md bg-white/90 p-2 text-xs text-slate-700 shadow-sm backdrop-blur-sm">
        <MapIcon className="mr-1 h-3 w-3 text-amber-600" />
        <p>Click on colored nodes to travel</p>
      </div>
    </>
  );
};

export default MapHeader;
