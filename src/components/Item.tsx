
import React from 'react';
import { Item as ItemType } from '@/types/game';
import { cn } from '@/lib/utils';

interface ItemProps {
  item: ItemType;
  onScan: (item: ItemType) => void;
  isAnimating?: boolean;
}

const Item: React.FC<ItemProps> = ({ item, onScan, isAnimating = true }) => {
  const handleClick = () => {
    onScan(item);
  };

  return (
    <div 
      className={cn(
        "relative cursor-pointer transform transition-transform duration-200 hover:scale-110",
        isAnimating && "conveyor-animation"
      )}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg shadow-md hover:shadow-lg w-20 h-24">
        <div className="text-4xl mb-1">{item.image}</div>
        <div className="text-xs font-medium truncate w-full text-center">{item.name}</div>
        {item.isScannable && (
          <div className="text-xs text-green-600 font-bold">${item.price.toFixed(2)}</div>
        )}
      </div>
    </div>
  );
};

export default Item;
