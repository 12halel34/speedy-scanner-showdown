
import React, { useState } from 'react';
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
  onLongPress?: (item: ItemType, e: React.MouseEvent) => void;
}

const Item: React.FC<ItemProps> = ({ 
  item, 
  onScan, 
  onThrow, 
  onMove,
  isAnimating = true,
  isThrowable = false,
  isDraggable = false,
  showPrice = true,
  onLongPress
}) => {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [processingClick, setProcessingClick] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent handling clicks if currently processing one or in dragging state
    if (isClicked || processingClick || isPressing || isDragging) {
      e.stopPropagation();
      return;
    }
    
    // Set states to prevent multiple actions
    setIsClicked(true);
    setProcessingClick(true);
    
    // If it's a mouse click (not a drag event ending with a click)
    if (e.detail > 0) {
      e.stopPropagation();
      
      if (isThrowable && onThrow) {
        onThrow(item);
      } else {
        // Use a short delay to prevent accidental clicks during drag operations
        setTimeout(() => {
          onScan(item);
        }, 50);
      }
    }
    
    // Reset states after a delay
    setTimeout(() => {
      setIsClicked(false);
      setProcessingClick(false);
    }, 1000);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDraggable) {
      setIsDragging(true);
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
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      }, 100);
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle mousedown for long press detection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onLongPress) return;
    
    // Don't start long press if we're already handling a click
    if (isClicked || processingClick) return;
    
    setIsPressing(true);
    
    // Set a timer for long press (200ms)
    const timer = setTimeout(() => {
      // Call the long press handler and pass the event
      try {
        onLongPress(item, e);
        
        // Add pulse animation to indicate item is being grabbed
        const element = e.currentTarget as HTMLElement;
        if (element && element.classList) {
          element.classList.add('pulse-grab');
          
          // Remove the animation class after it completes
          setTimeout(() => {
            if (element && element.classList) {
              element.classList.remove('pulse-grab');
            }
          }, 800);
        }
      } catch (error) {
        console.error("Error in handleMouseDown:", error);
      }
    }, 200);
    
    setPressTimer(timer);
  };
  
  // Clear the timer if mouse is released before long press threshold
  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setIsPressing(false);
  };
  
  // Clear the timer if mouse leaves the element
  const handleMouseLeave = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setIsPressing(false);
  };

  return (
    <div 
      className={cn(
        "relative cursor-pointer transform transition-all duration-200 hover:scale-110 active:scale-95",
        isAnimating && "conveyor-animation",
        isThrowable && "throwable-item",
        isDraggable && "cursor-grab active:cursor-grabbing",
        isPressing && "scale-105",
        isDragging && "opacity-70"
      )}
      onClick={handleClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
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
