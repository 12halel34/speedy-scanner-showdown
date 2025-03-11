
import React from 'react';
import { Item as ItemType } from '@/types/game';
import Item from './Item';

interface ConveyorBeltProps {
  items: ItemType[];
  onScanItem: (item: ItemType) => void;
}

const ConveyorBelt: React.FC<ConveyorBeltProps> = ({ items, onScanItem }) => {
  return (
    <div className="relative h-32 mt-6 mb-8 bg-gray-300 rounded-lg overflow-hidden shadow-inner">
      {/* Conveyor belt stripes */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 20 }).map((_, index) => (
          <div 
            key={index} 
            className="h-full w-8 bg-gray-400" 
            style={{ marginRight: '12px' }}
          />
        ))}
      </div>
      
      {/* Items on the belt */}
      <div className="relative h-full flex items-center overflow-hidden">
        <div className="absolute flex space-x-10 py-2 px-4">
          {items.map((item) => (
            <Item 
              key={`${item.id}-${Math.random()}`} 
              item={item} 
              onScan={onScanItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConveyorBelt;
