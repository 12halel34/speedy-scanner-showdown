
import React from 'react';
import { Item as ItemType } from '@/types/game';
import { cn } from '@/lib/utils';

interface ThrowingLanesProps {
  lanes: number[];
  thrownItems: ItemType[];
}

const ThrowingLanes: React.FC<ThrowingLanesProps> = ({ lanes, thrownItems }) => {
  return (
    <div className="w-full h-32 relative overflow-hidden">
      {/* Background lanes */}
      <div className="absolute inset-0 flex">
        {lanes.map((lane, index) => (
          <div 
            key={`lane-${index}`} 
            className="flex-1 h-full border-r border-dashed border-gray-300 relative"
          >
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-100 opacity-30 rounded-t-lg"></div>
            
            {/* Lane customers or targets */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="text-3xl">👤</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Thrown items */}
      {thrownItems.map((item, index) => (
        <div 
          key={`thrown-${item.id}-${index}`}
          className="absolute throwing-animation"
          style={{ 
            left: `${((item.lane || 0) / lanes.length) * 100}%`,
            marginLeft: "10px" 
          }}
        >
          <div className="text-4xl">{item.image}</div>
        </div>
      ))}
    </div>
  );
};

export default ThrowingLanes;
