
import React from 'react';
import { Item as ItemType } from '@/types/game';
import { cn } from '@/lib/utils';

interface ItemProps {
  item: ItemType;
  onScan: (item: ItemType) => void;
  onThrow?: (item: ItemType) => void;
  onMove?: (item: ItemType, destination: 'left' | 'right') => void;
  isAnimating?: boolean;
  isThrowable?: boolean;
  isDraggable?: boolean;
  showPrice?: boolean;
}

const Item: React.FC<ItemProps> = ({ 
  item, 
  onScan, 
  onThrow, 
  onMove,
  isAnimating = true,
  isThrowable = false,
  isDraggable = false,
  showPrice = true
}) => {
  const handleClick = () => {
    if (isThrowable && onThrow) {
      onThrow(item);
    } else {
      onScan(item);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDraggable) {
      e.dataTransfer.setData('text/plain', JSON.stringify(item));
      e.dataTransfer.effectAllowed = 'move';
      
      // Add visual feedback during drag
      const dragImage = document.createElement('div');
      dragImage.classList.add('drag-ghost');
      dragImage.innerHTML = item.image;
      dragImage.style.fontSize = '2em';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 20, 20);
      
      // Remove the ghost element after a short delay
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 100);
    }
  };

  return (
    <div 
      className={cn(
        "relative cursor-pointer transform transition-all duration-200 hover:scale-110 active:scale-95",
        isAnimating && "conveyor-animation",
        isThrowable && "throwable-item",
        isDraggable && "cursor-grab active:cursor-grabbing"
      )}
      onClick={handleClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      aria-label={`${item.name}`}
      title={isDraggable ? "Drag to scanner" : item.name}
    >
      <div className={cn(
        "flex flex-col items-center justify-center p-2 bg-white rounded-lg shadow-md hover:shadow-lg w-20 h-24",
        isThrowable && "border-2 border-green-500",
        item.location === 'right' ? "border-blue-300" : (item.location === 'left' ? "border-red-300" : "")
      )}>
        <div className="text-4xl mb-1">{item.image}</div>
        <div className="text-xs font-medium truncate w-full text-center">{item.name}</div>
        {item.isScannable && showPrice && !isThrowable && (
          <div className="text-xs text-green-600 font-bold">${item.price.toFixed(2)}</div>
        )}
      </div>
    </div>
  );
};

export default Item;
