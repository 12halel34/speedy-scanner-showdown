
import React from 'react';
import { Item as ItemType } from '@/types/game';
import Item from './Item';

interface ThrowableItemsDisplayProps {
  throwableItems: ItemType[];
  onThrow: (item: ItemType) => void;
}

const ThrowableItemsDisplay: React.FC<ThrowableItemsDisplayProps> = ({ 
  throwableItems, 
  onThrow 
}) => {
  if (throwableItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-center mb-2">Throwable Items</h3>
      <div className="flex justify-center space-x-4">
        {throwableItems.map(item => (
          <Item 
            key={`throwable-${item.id}`}
            item={item}
            onScan={() => {}}
            onThrow={onThrow}
            isAnimating={false}
            isThrowable={true}
          />
        ))}
      </div>
    </div>
  );
};

export default ThrowableItemsDisplay;
