import React from 'react';

const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 right-4 rounded-md bg-white/90 p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-blue-300 bg-blue-100"></span>
          <span>Battle</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-purple-300 bg-purple-100"></span>
          <span>Elite</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-green-300 bg-green-100"></span>
          <span>Shop</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-red-300 bg-red-100"></span>
          <span>Boss</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-amber-300 bg-amber-100"></span>
          <span>Rest</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-cyan-300 bg-cyan-100"></span>
          <span>Event</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
