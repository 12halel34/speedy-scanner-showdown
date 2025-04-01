
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
      // Map the new items to have positions, ensuring proper spacing
      const newItemsWithPosition = items.map((item, index) => {
        // Check if the item already exists in movingItems
        const existingItem = movingItems.find(mi => mi.id === item.id);
        
        if (existingItem) {
          return {
            ...item,
            position: existingItem.position // Keep existing position
          };
        } else {
          // For new items, calculate a position that avoids overlap
          // Start at 100 (right side) and space items 30 units apart
          return {
            ...item,
            position: 100 + (index * 30) // Space items at least 30 units apart
          };
        }
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

  // Check for potential item overlaps and adjust positions if needed
  useEffect(() => {
    if (movingItems.length <= 1) return;
    
    // Sort items by position from left to right
    const sortedItems = [...movingItems].sort((a, b) => a.position - b.position);
    
    const minSpacing = 25; // Minimum spacing between items in percentage units
    let needsAdjustment = false;
    
    // Check for overlaps
    for (let i = 0; i < sortedItems.length - 1; i++) {
      const currentItem = sortedItems[i];
      const nextItem = sortedItems[i + 1];
      
      // If items are too close, move the right one further right
      if (nextItem.position - currentItem.position < minSpacing) {
        nextItem.position = currentItem.position + minSpacing;
        needsAdjustment = true;
      }
    }
    
    if (needsAdjustment) {
      setMovingItems([...sortedItems]);
    }
  }, [movingItems]);
  
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
