import React from 'react';
import { ZapIcon } from 'lucide-react';

interface EnergyMeterProps {
  current: number;
  max: number;
}

const EnergyMeter: React.FC<EnergyMeterProps> = ({ current, max }) => {
  // Create an array of energy points
  const energyPoints = Array.from({ length: max }, (_, i) => i < current);

  return (
    <div className="flex flex-col items-center rounded-xl border border-game-energy/30 bg-slate-900/20 px-3 py-2">
      <div className="mb-1 flex items-center space-x-1 text-xs font-bold text-game-energy">
        <ZapIcon className="h-4 w-4" />
        <span>
          ENERGY {current}/{max}
        </span>
      </div>
      <div className="flex space-x-1.5">
        {energyPoints.map((isActive, index) => (
          <div
            key={index}
            className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${
              isActive
                ? 'animate-pulse bg-game-energy text-white shadow-md shadow-game-energy/30'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            <ZapIcon className="h-3 w-3" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnergyMeter;
