
import React from 'react';
import { Item as ItemType } from '@/types/game';
import { cn } from '@/lib/utils';

interface ItemProps {
  item: ItemType;
  onScan: (item: ItemType) => void;
  onThrow?: (item: ItemType) => void;
  isAnimating?: boolean;
  isThrowable?: boolean;
}

const Item: React.FC<ItemProps> = ({ 
  item, 
  onScan, 
  onThrow, 
  isAnimating = true,
  isThrowable = false
}) => {
  const handleClick = () => {
    if (isThrowable && onThrow) {
      onThrow(item);
    } else {
      onScan(item);
    }
  };

  return (
    <div 
      className={cn(
        "relative cursor-pointer transform transition-transform duration-200 hover:scale-110",
        isAnimating && "conveyor-animation",
        isThrowable && "throwable-item"
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "flex flex-col items-center justify-center p-2 bg-white rounded-lg shadow-md hover:shadow-lg w-20 h-24",
        isThrowable && "border-2 border-green-500"
      )}>
        <div className="text-4xl mb-1">{item.image}</div>
        <div className="text-xs font-medium truncate w-full text-center">{item.name}</div>
        {item.isScannable && !isThrowable && (
          <div className="text-xs text-green-600 font-bold">${item.price.toFixed(2)}</div>
        )}
        {isThrowable && (
          <div className="text-xs text-orange-500 font-bold">Throw me!</div>
        )}
      </div>
    </div>
  );
};

export default Item;
