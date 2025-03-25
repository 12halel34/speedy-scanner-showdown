
import React, { useState, useEffect } from 'react';
import { Item as ItemType } from '@/types/game';
import Item from './Item';

interface ConveyorBeltProps {
  items: ItemType[];
  onScanItem: (item: ItemType) => void;
  onMoveItem?: (item: ItemType, destination: 'left' | 'right') => void;
  onItemReachEnd?: (item: ItemType) => void;
  speedMultiplier: number;
}

const ConveyorBelt: React.FC<ConveyorBeltProps> = ({ 
  items, 
  onScanItem, 
  onMoveItem,
  onItemReachEnd,
  speedMultiplier = 1
}) => {
  const [movingItems, setMovingItems] = useState<(ItemType & { position: number })[]>([]);
  
  // Update items when the items prop changes
  useEffect(() => {
    if (items.length > 0) {
      // Map the new items to have positions
      const newItemsWithPosition = items.map(item => {
        // Check if the item already exists in movingItems
        const existingItem = movingItems.find(mi => mi.id === item.id);
        return {
          ...item,
          position: existingItem ? existingItem.position : 100 // Start new items from the right
        };
      });
      
      setMovingItems(prevItems => {
        // Filter out items that no longer exist in the incoming items
        const filteredItems = prevItems.filter(item => 
          newItemsWithPosition.some(ni => ni.id === item.id)
        );
        
        // Add any new items that aren't already in the moving items
        const itemsToAdd = newItemsWithPosition.filter(item => 
          !filteredItems.some(fi => fi.id === item.id)
        );
        
        return [...filteredItems, ...itemsToAdd];
      });
    }
  }, [items]);
  
  // Animation effect for moving items
  useEffect(() => {
    if (movingItems.length === 0) return;
    
    const moveInterval = setInterval(() => {
      setMovingItems(prevItems => {
        // Move each item to the left with speedMultiplier affecting the speed
        const updatedItems = prevItems.map(item => ({
          ...item,
          position: item.position - (0.5 * speedMultiplier) // Speed increases with the multiplier
        }));
        
        // Check for items that have reached the left edge
        const itemsToRemove = updatedItems.filter(item => item.position <= -15);
        
        // Notify parent of items reaching the end
        itemsToRemove.forEach(item => {
          if (onItemReachEnd) {
            onItemReachEnd(item);
          }
        });
        
        // Remove items that have gone off screen
        return updatedItems.filter(item => item.position > -15);
      });
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(moveInterval);
  }, [movingItems, onItemReachEnd, speedMultiplier]);
  
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
      <div className="relative h-full">
        {movingItems.map((item) => (
          <div 
            key={`${item.id}-${Math.random()}`} 
            className="absolute"
            style={{ 
              left: `${item.position}%`,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <Item 
              item={item} 
              onScan={onScanItem}
              onMove={onMoveItem}
              isDraggable={true}
              isAnimating={false} // We're handling animation ourselves
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConveyorBelt;
