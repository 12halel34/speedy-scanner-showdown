
import React from 'react';
import { Item } from '@/types/game';

interface ThrowingLanesProps {
  lanes: number[];
  thrownItems: Item[];
}

const ThrowingLanes: React.FC<ThrowingLanesProps> = ({ lanes, thrownItems }) => {
  return (
    <div className="throwing-lanes my-4">
      <h4 className="text-md font-semibold mb-2">Vegetable Throwing Area</h4>
      <div className="flex justify-around space-x-2">
        {lanes.map((lane) => {
          // Get items thrown in this lane
          const itemsInLane = thrownItems.filter(item => item.lane === lane);
          
          // Generate a unique game identifier for each lane
          const gameIdentifier = `game-${lane}`;
          
          return (
            <div 
              key={lane} 
              className="throwing-lane bg-green-100 h-24 flex-1 rounded-lg flex flex-col items-center justify-center relative"
              data-game-id={gameIdentifier}
            >
              <div className="absolute bottom-1 text-center text-xs text-gray-500">
                Lane {lane + 1}
              </div>
              
              <div className="game-target">
                {/* Different target game for each lane */}
                {lane === 0 && <div className="text-2xl">🎯</div>}
                {lane === 1 && <div className="text-2xl">🎪</div>}
                {lane === 2 && <div className="text-2xl">🎮</div>}
                {lane === 3 && <div className="text-2xl">🎲</div>}
              </div>
              
              {/* Thrown items in this lane */}
              <div className="thrown-items absolute">
                {itemsInLane.map(item => (
                  <div 
                    key={item.id} 
                    className="thrown-item text-3xl animate-bounce"
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {item.image}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThrowingLanes;
